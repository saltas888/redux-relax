import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {single, multiple} from '../distribution-thunk/thunk/loadDataHOC'
import get from 'lodash/get'

import Repo from '../components/Repo'
import User from '../components/User'
import List from '../components/List'


function getSearchUrl(state, ownProps){

  const login = ownProps.params.login.toLowerCase()
  const name = ownProps.params.name.toLowerCase()
  return {search:`${login}/${name}`}
}

class RepoPage extends Component {
  constructor(props) {
    super(props)
    this.renderUser = this.renderUser.bind(this)
    this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this)
  }

  componentWillMount() {
    this.props.loadRepo(this.props.fullName)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fullName !== this.props.fullName) {
      this.props.loadRepo(nextProps.fullName)
    }
  }

  handleLoadMoreClick() {
    console.log('test')
    this.props.loadMoreUsers(this.props.fullName)
  }

  renderUser(user) {
    return (
      <User user={user}
            key={user.login} />
    )
  }

  render() {
    const { repo, owner, name } = this.props
    if (!repo || !owner) {
      return <h1><i>Loading {name} details...</i></h1>
    }

    const { users, isFetching, nextPageUrl, pageCount } = this.props
    return (
      <div>
        <Repo repo={repo}
                    owner={owner} />
        <hr />
        <List renderItem={this.renderUser}
              items={users}
              onLoadMoreClick={this.handleLoadMoreClick}
              loadingLabel={`Loading stargazers of ${name}...`}
              isFetching={isFetching}
              pageCount={pageCount}
              nextPageUrl={nextPageUrl} />
      </div>
    )
  }
}


RepoPage = multiple('users', getSearchUrl)(RepoPage)

RepoPage = single('repos', (state, ownProps) => {
  const login = ownProps.params.login.toLowerCase()
  const name = ownProps.params.name.toLowerCase()
  return `${login}/${name}`
})(RepoPage)

RepoPage.propTypes = {
  repo: PropTypes.object,
  fullName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  owner: PropTypes.object,
}

function mapStateToProps(state, ownProps) {
  const login = ownProps.params.login.toLowerCase()
  const name = ownProps.params.name.toLowerCase()
  const {
    entities: { users, repos }
  } = state

  const fullName = `${login}/${name}`
  return {
    fullName,
    name,
    owner: get(repos[fullName], 'owner')
  }
}

export default connect(mapStateToProps, {
})(RepoPage)

