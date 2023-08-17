// MODULES
import React from 'react';

// STYLES
import '../styles/index.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <this.props.Component {...this.props.pageProps} />;
  }
}

export default App;
