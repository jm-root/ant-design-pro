import React, { Component, Fragment } from 'react';
import { connect } from 'dva';

@connect(({ loading, simple }) => ({
  simple,
  loading: loading.models.simple,
}))
class List extends Component {
  render() {
    return <Fragment>对不起，我偷懒了，假装这里有个很漂亮的列表吧</Fragment>;
  }
}

export default List;
