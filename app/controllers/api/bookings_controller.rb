module Api
  class BookingsController < ApplicationController
    def create
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)
      return render json: { error: 'user not logged in' }, status: :unauthorized if !session

      property = Property.find_by(id: params[:booking][:property_id])
      return render json: { error: 'cannot find property' }, status: :not_found if !property

      begin
        @booking = Booking.create({ user_id: session.user.id, property_id: property.id, start_date: params[:booking][:start_date], end_date: params[:booking][:end_date]})
        render 'api/bookings/create', status: :created
      rescue ArgumentError => e
        render json: { error: e.message }, status: :bad_request
      end
    end

    def get_property_bookings
      property = Property.find_by(id: params[:id])
      return render json: { error: 'cannot find property' }, status: :not_found if !property

      @bookings = property.bookings.where("end_date > ? ", Date.today)
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
      bookings = Booking.where(user_id: user.id).includes(:property)
    
      render json: bookings.map { |booking| 
        booking.as_json.merge(
          property_image_url: booking.property.image_url,
          property_title: booking.property.title 
        )
      }
    end

    def host_bookings
      user = User.find_by(username: params[:username])
      return render json: { error: 'user not found' }, status: :not_found unless user
    
      properties = user.properties
      bookings = Booking.where(property_id: properties.pluck(:id))
    
      render json: bookings, include: { property: { only: [:title, :address] } }
    end

    def success
      booking = Booking.find(params[:id])
    
      if booking.is_paid?
        status_message = "Your booking is complete!"
      else
        status_message = "Your booking is being processed."
      end
    
      render json: {
        booking: booking,
        status_message: status_message
      }
    end
    
    private
    def success
      booking = Booking.find(params[:id])
  
      if booking.is_paid?
        status_message = "Your booking is complete!"
      else
        status_message = "Your booking is being processed."
      end
  
      render json: {
        booking: booking,
        status_message: status_message
      }
    end
    
    def booking_params
      params.require(:booking).permit(:property_id, :start_date, :end_date)
    end
  end
end