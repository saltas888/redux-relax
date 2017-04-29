import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import zip from 'lodash/array/zip'
import {single, multiple} from '../../distribution-saga/saga/loadDataHOC'

import User from '../components/User'
import Repo from '../components/Repo'
import List from '../components/List'

function getSearchUrl(state){

  const { login } = state.router.params
  return {search:login}
}

@multiple('repos', getSearchUrl)
@single('users', (state, ownProps) => {
  const { login } = state.router.params
  return login
})
class UserPage extends Component {
  constructor(props) {
    super(props)
    this.renderRepo = this.renderRepo.bind(this)
    this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this)
  }

  componentWillMount() {
    this.props.loadUser(this.props.login)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.login !== nextProps.login) {
      this.props.loadUser(nextProps.login)
      this.props.loadRepos(nextProps.login)
    }
  }

  handleLoadMoreClick() {
    this.props.loadMoreRepos(this.props.login)
  }

  renderRepo(repo) {
    return (
      <Repo repo={repo}
            owner={repo.owner}
            key={repo.fullName} />
    )
  }

  render() {
    const { user, login } = this.props

    if (!user) {
      return <h1><i>Loading {login}’s profile...</i></h1>
    }

    const { repos, isFetching, nextPageUrl } = this.props
    return (
      <div>
        <User user={user} />
        <hr />
        <List renderItem={this.renderRepo}
              items={repos}
              onLoadMoreClick={this.handleLoadMoreClick}
              loadingLabel={`Loading ${login}’s starred...`}
              nextPageUrl={nextPageUrl}
              isFetching={isFetching} />
      </div>
    )
  }
}

UserPage.propTypes = {
  login: PropTypes.string.isRequired,
  user: PropTypes.object,
  starredPagination: PropTypes.object,
  starredRepos: PropTypes.array.isRequired,
  starredRepoOwners: PropTypes.array.isRequired,
  loadUserPage: PropTypes.func.isRequired,
  loadMoreStarred: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { login } = state.router.params
  const {
    entities: { users, repos }
  } = state

  return {
    login,
    user: users[login]
  }
}

export default connect(mapStateToProps, {
})(UserPage)
