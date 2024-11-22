import { createSelector } from 'reselect';

const getInitialState = state => state.reports.isRunningReport;
const getNavbarParams = state => state.settings.navbarParams;

export default createSelector([
    getInitialState,
    getNavbarParams
], (isRunningReport, navbarParams) => ({
    isRunningReport,
    navbarParams
}));
