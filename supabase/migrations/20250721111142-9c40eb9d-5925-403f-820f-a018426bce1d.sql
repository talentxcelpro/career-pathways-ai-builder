-- Create service booking requests table
CREATE TABLE public.service_booking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  
  -- Client information
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  
  -- Booking details
  project_description TEXT NOT NULL,
  preferred_start_date DATE,
  budget_range TEXT,
  urgency TEXT DEFAULT 'standard',
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  provider_response TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.service_booking_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for service booking requests
CREATE POLICY "Clients can view their own booking requests" 
ON public.service_booking_requests 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can create booking requests" 
ON public.service_booking_requests 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Providers can view requests for their services" 
ON public.service_booking_requests 
FOR SELECT 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can update requests for their services" 
ON public.service_booking_requests 
FOR UPDATE 
USING (auth.uid() = provider_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_service_booking_requests_updated_at
BEFORE UPDATE ON public.service_booking_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create notification trigger for new booking requests
CREATE OR REPLACE FUNCTION public.notify_service_booking_request()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify the service provider about new booking request
    PERFORM public.create_notification(
      NEW.provider_id,
      'service_booking',
      'New Service Booking Request',
      NEW.client_name || ' has requested your service: ' || (SELECT title FROM public.services WHERE id = NEW.service_id),
      'services',
      NEW.id,
      '/pro/services',
      'high',
      'calendar'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_service_booking_request_trigger
AFTER INSERT ON public.service_booking_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_service_booking_request();