module Api
  class PropertiesController < ApplicationController
    before_action :authenticate_user!, only: [:create, :destroy, :update, :show]

    protect_from_forgery with: :exception
     skip_before_action :verify_authenticity_token, if: :json_request?

      def json_request?
        request.format.json?
      end

    def index
      @properties = Property.order(created_at: :desc).page(params[:page]).per(6)
      render 'api/properties/index', status: :ok
    end

    def index_by_user
      user = User.find_by(username: params[:username])

      if user
        @properties = user.properties.order(created_at: :desc)
        render 'api/properties/index', status: :ok
      else
        render json: { error: 'user_not_found' }, status: :not_found
      end
    end

    def show
      @property = Property.find_by(id: params[:id])

      if @property
        render 'api/properties/show', status: :ok
        
      else
        render json: { error: 'not_found' }, status: :not_found
      end
    end

    include Rails.application.routes.url_helpers

    def create
      @property = @current_user.properties.new(property_params)
      if @property.save
        render json: {
          property: @property.as_json.merge({
            image_url: url_for(@property.image)
          })
        }, status: :created
      else
        render json: { errors: @property.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def user_properties
      user = User.find_by(username: params[:username])
    
      if user
        render json: user.properties.map { |p| p.as_json(methods: [:image_url]) }
      else
        render json: [], status: :ok
      end
    end
    

    def update
      @property = Property.find(params[:id])
    
      if @property.user != @current_user
        render json: { error: 'forbidden' }, status: :forbidden
        return
      end
    
      if @property.update(property_params)
        render json: @property.as_json(methods: [:image_url]), status: :ok
      else
        render json: { errors: @property.errors.full_messages }, status: :unprocessable_entity
      end
    end
    

    def destroy
      property = Property.find_by(id: params[:id])

      if property.nil?
        render json: { error: 'not_found' }, status: :not_found
      elsif property.user != @current_user
        render json: { error: 'forbidden' }, status: :forbidden
      elsif property.destroy
        render json: { success: true }, status: :ok
      else
        render json: { success: false }, status: :unprocessable_entity
      end
    end

    private

    def authenticate_user!
      token = cookies.signed[:airbnb_session_token]
      Rails.logger.debug "Session token: #{token}"  # Log the token
      session = Session.find_by(token: token)
      @current_user = session&.user
      Rails.logger.debug "Current user: #{@current_user.inspect}"  # Log current user
    end

    def property_params
      params.require(:property).permit(:title, :description, :price_per_night, :image, :city, :country, :property_type, :max_guests, :bedrooms, :beds, :baths)
    end
  end
end
