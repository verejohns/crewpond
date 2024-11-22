import { paths } from '../../../../../utils'
import moment from 'moment'

export default [
    {
        name: 'Dashboard',
        url: paths.client.APP_BASE
    }, {
        name: 'Jobs',
        url: paths.client.APP_JOBS,
        children: [{
            name: 'Create',
            url: paths.client.APP_NEW_JOB
        }, {
            name: 'Search',
            url: paths.client.APP_JOBS
        }]
    }, {
        name: 'My Calendar',
        url: paths.client.APP_SCHEDULE + '?viewMode=week&startDate=' + encodeURIComponent(moment().startOf('isoWeek').format('YYYY-MM-DDTHH:mm:ssZ')).replace(" ", "%20")
    }, {
        name: 'Chats',
        url: paths.client.APP_MESSAGES
    }, {
        name: 'Invoices',
        url: paths.client.APP_INVOICES
    }, /*{
        name: 'Reports',
        url: paths.client.APP_REPORTS
    }*/
];
