import { MIXPANEL_TOKEN } from 'utils/config';
import mixpanel from 'mixpanel-browser';

/*
todo: Disable this for local development?
I'm not doing this yet, because i'd like to track some performance
metrics when it comes to dev experience as well
*/
mixpanel.init(MIXPANEL_TOKEN);

export default mixpanel;
