Rails.application.routes.draw do
  root to: 'static_pages#home', via: :get 

  get '/property/:id' => 'static_pages#property'
  get '/login' => 'static_pages#login'
  get '/user_page' => 'static_pages#user_page'
  # config/routes.rb

  get '/booking/:id/success' => 'bookings#success', as: 'booking_success'


  
  namespace :api do
    resources :users, only: [:create]
    resources :sessions, only: [:create, :destroy]
    resources :properties, only: [:index, :show, :create, :destroy, :update]
    resources :bookings, only: [:create, :index]
    resources :charges, only: [:create]

    get '/properties/:id/bookings' => 'bookings#get_property_bookings'
    get '/authenticated' => 'sessions#authenticated'
    get '/users/:username/property', to: 'properties#user_properties' 
    get '/users/:username/bookings', to: 'bookings#guest_bookings'
    get '/charges/new_checkout_session', to: 'charges#new_checkout_session'
    get '/users/:username/host_bookings', to: 'bookings#host_bookings'
    
    
    post '/charges/mark_complete' => 'charges#mark_complete'
  end

end
