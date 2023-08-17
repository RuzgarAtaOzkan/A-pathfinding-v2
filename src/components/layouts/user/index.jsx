// MODULES
import React from 'react';
import cn from 'classnames';

// STYLES
import style from './style.module.css';

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <main className={cn(style['main'])}>
          {this.props.children || this.props.element}
        </main>
      </>
    );
  }
}

export default User;
