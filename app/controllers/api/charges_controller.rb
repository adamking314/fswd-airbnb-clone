module Api
    class ChargesController < ApplicationController
      def create
        token = cookies.signed[:airbnb_session_token]
        session = Session.find_by(token: token)
        return render json: { error: 'user not logged in' }, status: :unauthorized if !session
  
        booking = Booking.find_by(id: params[:booking_id])
        return render json: { error: 'cannot find booking' }, status: :not_found if !booking
  
        property = booking.property
        days_booked = (booking.end_date - booking.start_date).to_i
        amount = days_booked * property.price_per_night
  
        session = Stripe::Checkout::Session.create(
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              unit_amount: (amount * 100.0).to_i, # amount in cents
              product_data: {
                name: "Trip for #{property.title}",
                description: "Your booking is for #{booking.start_date} to #{booking.end_date}.",
              },
            },
            quantity: 1,
          }],
          mode: "payment",
          success_url: "#{ENV['URL']}/booking/#{booking.id}/success",
          cancel_url: "#{ENV['URL']}#{params[:cancel_url]}",
        )
  
        @charge = booking.charges.new({
          checkout_session_id: session.id,
          currency: 'usd',
          amount: amount
        })
  
        if @charge.save
          render 'api/charges/create', status: :created
        else
          render json: { error: 'charge could not be created' }, status: :bad_request
        end
      end


      def mark_complete
        # Retrieve the webhook signing secret from your environment variable
        endpoint_secret = ENV['STRIPE_WEBHOOK_SECRET']
        event = nil
    
        # Get the raw payload and signature from the request
        sig_header = request.env['HTTP_STRIPE_SIGNATURE']
        payload = request.body.read
    
        begin
          # Verify the webhook signature and parse the event
          event = Stripe::Webhook.construct_event(payload, sig_header, endpoint_secret)
        rescue JSON::ParserError => e
          # Handle invalid payload
          Rails.logger.error "JSON parsing error: #{e.message}"
          return head :bad_request
        rescue Stripe::SignatureVerificationError => e
          # Handle invalid signature
          Rails.logger.error "Signature verification failed: #{e.message}"
          return head :bad_request
        end
    
        # Log the event to inspect the data structure
        Rails.logger.info "Received event: #{event.inspect}"
    
        # Handle the checkout.session.completed event
        if event['type'] == 'checkout.session.completed'
          session = event['data']['object'] # The session data
          Rails.logger.info "Session data: #{session.inspect}"
    
          # Find the booking based on the session ID (or use any other relevant identifier)
          booking_id = session['client_reference_id'] # Use client_reference_id if available
          booking = Booking.find_by(id: booking_id)
    
          if booking
            # Mark the booking as paid or perform any other necessary updates
            booking.update(status: 'paid')
            # Optionally, create a charge record or log additional details
            Charge.create(booking_id: booking.id, status: 'paid', amount: session['amount_total'])
    
            return head :ok
          else
            # If booking is not found, log and return an error
            Rails.logger.error "Booking not found for session ID: #{session['id']}"
            return head :not_found
          end
        end
    
        return head :bad_request
      end
    end
  end