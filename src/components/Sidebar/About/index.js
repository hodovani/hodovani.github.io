import React, {Component} from 'react';

import './style.scss';

class About extends Component {
  render() {
    return (
      <div className="about">
        <div className="image" />
        <div className="bio">
          I am a freelance web developer specialised in both front-end and
          back-end web development.
          <div className="emoji">🤖 &nbsp;🏔&nbsp;🤸‍♂️ 👨‍💻</div>
        </div>
      </div>
    );
  }
}
export default About;
