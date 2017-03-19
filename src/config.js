export default {
  apiEndpoint: '',//required
  reducers:{
    paginate:{
      totalPageCountField: 'pages', //required
      totalCountField: 'totalCount', //required
      currentPageField: undefined //optional
    },
  },
  entities:[
    // {
    //   uniqueIdAttribute: 'id', //required
    //   name: '', //required
    //   apiUrl:'/', //required,
    //   paginationExtraFields:undefined,
    //   paginationKey: 'query',
    //   manual: undefined
    // }
  ]
}