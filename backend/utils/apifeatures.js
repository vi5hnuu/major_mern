class ApiFeatures {
  constructor(query, querystr) {//query->dbquery,querystr-> /?sort=asc => {sort:asc}
    this.query = query;
    this.querystr = querystr;
  }
  search() {
    const keyword = this.querystr.keyword ? {
      name: {
        $regex: this.querystr.keyword,
        $options: "i"
      }
    } : {}
    this.query = this.query.find({ ...keyword })
    return this
  }
  filter() {
    const querystrcopy = { ...this.querystr }

    //REMOVE some fields for category
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach(key => delete querystrcopy[key])

    //filter for price and rating
    let qStr = JSON.stringify(querystrcopy).replace(/\b(gt|gte|lt|lte)\b/g, (key) => {
      return `$${key}`
    })
    this.query = this.query.find(JSON.parse(qStr));
    return this;
  }
  pagination(resultPerPage) {
    const currentPage = Number(this.querystr.page) || 1
    const skipPr = (currentPage - 1) * resultPerPage
    this.query = this.query.limit(resultPerPage).skip(skipPr)
    return this;
  }
}

module.exports.ApiFeatures = ApiFeatures