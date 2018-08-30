import React from 'react'
import ExperienceSection from '../components/ExperienceSection'
import About from '../components/Sidebar/About'
import Links from '../components/Sidebar/Links'

import './style.scss'

const IndexPage = () => (
    <div className="index">
      <div className="main">
        <h5>
          Hi, I'm <span className="bold">Matvii Hodovaniuk</span>
        </h5>

        <h3 className="bold">
          Full stack product engineer with 3 years' experience building products.
        </h3>

        <ExperienceSection />
      </div>

      <div className="aside">
        <div className="top">
          <About />
        </div>
        <div className="bottom">
          <Links />
        </div>
      </div>
    </div>
)

export default IndexPage
