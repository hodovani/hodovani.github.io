import React, {Component} from 'react';

import './style.scss';
import 'font-awesome/css/font-awesome.min.css';

class Links extends Component {
  render() {
    return (
      <div className="links">
        <ul className="icons-list">
          <li className="icon">
            <a href="https://www.github.com/hodovani" target="_blank">
              <i className="fa fa-github" />
            </a>
          </li>
          <li className="icon">
            <a href="https://www.twitter.com/hodovani" target="_blank">
              <i className="fa fa-twitter" />
            </a>
          </li>
          <li className="icon">
            <a
              href="https://www.linkedin.com/in/matvii-hodovaniuk/"
              target="_blank">
              <i className="fa fa-linkedin" />
            </a>
          </li>
          <li className="icon">
            <a href="mailto:matvii@hodovani.uk" target="_blank">
              <i className="fa fa-envelope" />
            </a>
          </li>
        </ul>
        <div className="small">
          Built with ❤️ using{' '}
          <a href="https://www.gatsbyjs.org/" target="_blank">
            GatsbyJS
          </a>
        </div>
      </div>
    );
  }
}

export default Links;
