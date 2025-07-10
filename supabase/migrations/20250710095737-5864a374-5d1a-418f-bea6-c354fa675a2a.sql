-- Create trigger for company follows notifications
CREATE TRIGGER notify_company_follow_trigger
    AFTER INSERT ON public.company_follows
    FOR EACH ROW EXECUTE FUNCTION public.notify_company_activities();