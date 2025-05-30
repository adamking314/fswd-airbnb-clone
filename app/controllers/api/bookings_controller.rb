module Api
  class BookingsController < ApplicationController
    def create
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)
      return render json: { error: 'user not logged in' }, status: :unauthorized if !session

      property = Property.find_by(id: params[:booking][:property_id])
      return render json: { error: 'cannot find property' }, status: :not_found if !property

      begin
        @booking = Booking.create({
          user_id: session.user.id,
          property_id: property.id,
          start_date: params[:booking][:start_date],
          end_date: params[:booking][:end_date]
        })
        render 'api/bookings/create', status: :created
      rescue ArgumentError => e
        render json: { error: e.message }, status: :bad_request
      end
    end

    def get_property_bookings
      property = Property.find_by(id: params[:id])
      return render json: { error: 'cannot find property' }, status: :not_found if !property

      @bookings = property.bookings.where("end_date > ?", Date.today)
      render 'api/bookings/index'
    end

    def index
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)
      return render json: { error: 'user not logged in' }, status: :unauthorized unless session
    
      @bookings = session.user.bookings.includes(:property)
      render 'api/bookings/user_bookings'
    end

    def guest_bookings
      user = User.find_by(username: params[:username])
      bookings = Booking.where(user_id: user.id).includes(:property, :charges)
    
      render json: bookings.map { |booking| 
        latest_charge = booking.charges.order(created_at: :desc).first
        paid = latest_charge&.complete || false
    
        {
          id: booking.id,
          start_date: booking.start_date,
          end_date: booking.end_date,
          paid: paid,  # 👈 include paid status
          property_title: booking.property.title,
          property_image_url: booking.property.image_url
        }
      }
    end

    def host_bookings
      user = User.find_by(username: params[:username])
      return render json: { error: 'user not found' }, status: :not_found unless user
    
      properties = user.properties
      bookings = Booking.where(property_id: properties.pluck(:id)).includes(:property, :charges)
    
      render json: bookings.map { |booking|
          latest_charge = booking.charges.order(created_at: :desc).first
          paid = latest_charge&.complete || false

        {
          id: booking.id,
          start_date: booking.start_date,
          end_date: booking.end_date,
          paid: paid,
          guest_username: booking.user.username,
           property: {
              title: booking.property.title,
              address: booking.property.try(:address)
            }
           }
        }
    end

    def show
      @booking = Booking.includes(:property).find_by(id: params[:id])
      if @booking
        latest_charge = @booking.charges.order(created_at: :desc).first
        paid = latest_charge&.complete || false
    
        render json: {
          id: @booking.id,
          start_date: @booking.start_date,
          end_date: @booking.end_date,
          paid: paid, # ✅ status derived from charge
          total_price: (@booking.end_date - @booking.start_date).to_i * @booking.property.price_per_night,
          property: {
            id: @booking.property.id,
            title: @booking.property.title,
            city: @booking.property.city,
            country: @booking.property.country,
            price_per_night: @booking.property.price_per_night
          }
        }
      else
        render json: { error: 'Booking not found' }, status: :not_found
      end

    end

    def success
      booking = Booking.find_by(id: params[:id])
    
      if booking.nil?
        render json: { error: "Booking not found" }, status: :not_found
        return
      end
    
      # You can now include the property with the booking
      property = booking.property
    
      # Check if the booking is paid and prepare the status message
      if booking.is_paid? # Ensure this method exists in your model
        status_message = "Your booking is complete!"
      else
        status_message = "Your booking is being processed."
      end
    
      # Generate the image URL using ActiveStorage if an image is attached
      property_image_url = property.image.attached? ? Rails.application.routes.url_helpers.url_for(property.image) : nil
    
      # Render the booking and property details as JSON
      render :success
      
      render json: {
        booking: booking,
        status_message: status_message,
        property: {
          id: property.id,
          title: property.title,
          image_url: property_image_url,  # Properly generated image URL
          start_date: booking.start_date,
          end_date: booking.end_date,
          price_per_night: property.price_per_night,  # You can add other fields as needed
          # Add other property fields as needed
        }
      }
    end    

    private
    def booking_params
      params.require(:booking).permit(:property_id, :start_date, :end_date)
    end
  end
end
