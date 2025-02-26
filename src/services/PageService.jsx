export class PageService {
  constructor({ apiClient }) {
    this.apiClient = apiClient
  }

  // eslint-disable-next-line class-methods-use-this
  getPageEndpoint({
    siteName,
    collectionName,
    subCollectionName,
    resourceRoomName,
    resourceCategoryName,
    fileName,
  }) {
    let endpoint = `/sites/${siteName}`
    if (collectionName) {
      endpoint += `/collections/${collectionName}`
    }
    if (subCollectionName) {
      endpoint += `/subcollections/${subCollectionName}`
    }
    if (resourceRoomName) {
      endpoint += `/resourceRoom/${resourceRoomName}`
    }
    if (resourceCategoryName) {
      endpoint += `/resources/${resourceCategoryName}`
    }
    if (
      !collectionName &&
      !subCollectionName &&
      !resourceRoomName &&
      !resourceCategoryName
    ) {
      // unlinked page endpoint
      endpoint += `/pages`
    }
    endpoint += `/pages`
    if (fileName) {
      endpoint += `/${fileName}`
    }
    return endpoint
  }

  async create(apiParams, { newFileName, frontMatter }) {
    const body = {
      content: {
        frontMatter,
      },
      newFileName,
    }
    return this.apiClient.post(this.getPageEndpoint(apiParams), body)
  }

  async update(apiParams, { newFileName, sha, frontMatter, pageBody }) {
    const body = {
      content: {
        pageBody,
        frontMatter,
      },
      newFileName,
      sha,
    }
    await this.apiClient.post(this.getPageEndpoint(apiParams), body)
  }

  async get(apiParams) {
    return this.apiClient
      .get(this.getPageEndpoint(apiParams))
      .then((res) => res.data)
  }

  async delete(apiParams, { sha }) {
    const body = {
      sha,
    }
    return this.apiClient
      .delete(this.getPageEndpoint(apiParams), { data: body })
      .then((res) => res.data)
  }
}
