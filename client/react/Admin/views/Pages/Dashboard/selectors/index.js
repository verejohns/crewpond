import { createSelector } from 'reselect';

const getIsSubmitting = state => state.dashboard.isSubmitting;
const getIsLoadedCardGraph = state => state.dashboard.isLoadedCardGraph;
const getCardGraph = state => state.dashboard.card_graph;

const getIsLoadedContractGraph = state => state.dashboard.isLoadedContractGraph;
const getContractGraph = state => state.dashboard.contract_graph;

const getIsLoadedTopRatedUsers = state => state.dashboard.isLoadedTopRatedUsers;
const getTopRatedUsers = state => state.dashboard.top_rated_users;

const getIsLoadedUsersInfo = state => state.dashboard.isLoadedUsersInfo;
const getUsersInfo = state => state.dashboard.users_info;

const getIsLoadedJobsInfo = state => state.dashboard.isLoadedJobsInfo;
const getJobsInfo = state => state.dashboard.jobs_info;

export default createSelector([
  getIsSubmitting,
  getIsLoadedCardGraph,
  getCardGraph,
  getIsLoadedContractGraph,
  getContractGraph,
  getIsLoadedTopRatedUsers,
  getTopRatedUsers,
  getIsLoadedUsersInfo,
  getUsersInfo,
  getIsLoadedJobsInfo,
  getJobsInfo
], (isSubmitting, isLoadedCardGraph, card_graph, isLoadedContractGraph, contract_graph, isLoadedTopRatedUsers, top_rated_users, isLoadedUsersInfo, users_info, isLoadedJobsInfo, jobs_info) => ({
    isSubmitting,
    isLoadedCardGraph,
    card_graph, 
    isLoadedContractGraph, 
    contract_graph, 
    isLoadedTopRatedUsers, 
    top_rated_users, 
    isLoadedUsersInfo, 
    users_info, 
    isLoadedJobsInfo, 
    jobs_info
}));
