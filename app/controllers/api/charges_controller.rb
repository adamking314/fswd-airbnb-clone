module Api
  class ChargesController < ApplicationController
    skip_before_action :verify_authenticity_token, only: [:mark_complete]

    def create
      user_session = Session.find_by(token: cookies.signed[:airbnb_session_token])
      return render json: { error: 'user not logged in' }, status: :unauthorized unless user_session

      booking = Booking.find_by(id: params[:booking_id])
      return render json: { error: 'cannot find booking' }, status: :not_found unless booking

      property     = booking.property
      days_booked  = (booking.end_date - booking.start_date).to_i
      amount       = days_booked * property.price_per_night

      stripe_session = Stripe::Checkout::Session.create(
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            unit_amount: (amount * 100).to_i,
            product_data: {
              name:        "Trip for #{property.title}",
              description: "Your booking is for #{booking.start_date} to #{booking.end_date}",
            },
          },
          quantity: 1,
        }],
        mode:              'payment',
        success_url:       "#{ENV['URL']}/booking/#{booking.id}/success",
        cancel_url:        "#{ENV['URL']}#{params[:cancel_url]}",
        client_reference_id: booking.id,
        metadata: { booking_id: booking.id.to_s }
      )

      @charge = booking.charges.build(
        checkout_session_id: stripe_session.id,
        currency:            'usd',
        amount:              amount
      )

      if @charge.save
        render 'api/charges/create', status: :created
      else
        render json: { error: 'charge could not be created' }, status: :bad_request
      end
    end

    def mark_complete
      endpoint_secret = ENV['STRIPE_MARK_COMPLETE_WEBHOOK_SIGNING_SECRET']
      payload         = request.body.read
      signature       = request.env['HTTP_STRIPE_SIGNATURE']

      event = Stripe::Webhook.construct_event(payload, signature, endpoint_secret)

      if event.type == 'checkout.session.completed'
        session_obj = event.data.object
        charge      = Charge.find_by(checkout_session_id: session_obj.id)
        if charge
          charge.update!(complete: true)
          charge.booking.update!(paid: true)
        end
      end

      head :ok
    rescue JSON::ParserError, Stripe::SignatureVerificationError
      head :bad_request
    end
  end
end
