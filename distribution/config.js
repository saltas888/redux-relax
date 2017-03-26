'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  apiEndpoint: '', //required
  reducers: {
    paginate: {
      totalPageCountField: 'pages', //required
      totalCountField: 'totalCount', //required
      currentPageField: undefined //optional
    }
  },
  headers: function headers(state) {
    return {};
  },
  entities: [
    // {
    //   uniqueIdAttribute: 'id', //required
    //   itemsField: 'items', // field inside api response that includes the data
    //   name: '', //required
    //   apiUrl:'/', //required,
    //   paginationExtraFields:undefined,
    //   paginationKey: 'query',
    //   manual: undefined
    // }
  ]
};