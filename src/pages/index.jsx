// MODULES
import React from 'react';

// COMPONENTS
import Head from '../components/head/index.jsx';
import Layout_user from '../components/layouts/user/index.jsx';
import Pathfinding from '../components/pathfinding/index.jsx';

// STYLES
import style from '../styles/pages/home.module.css';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  componentDidUpdate() {}

  componentWillUnmount() {}

  render() {
    return (
      <>
        <Head title="" desc="" />

        <Layout_user>
          <Pathfinding />
        </Layout_user>
      </>
    );
  }
}

export default Home;
