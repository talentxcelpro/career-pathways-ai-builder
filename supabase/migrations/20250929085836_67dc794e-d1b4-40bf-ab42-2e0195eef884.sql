-- Ensure the TXC trigger is attached to the posts table
DROP TRIGGER IF EXISTS trigger_award_txc_for_post ON public.posts;

CREATE TRIGGER trigger_award_txc_for_post
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_txc_for_post();