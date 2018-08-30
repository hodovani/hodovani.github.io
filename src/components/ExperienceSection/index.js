import React from 'react';
import Section from '../Section';
import ExperienceUnit from '../ExperienceUnit';

import kfpLogo from '../../assets/images/experience/kfp_logo.png';
import tangibleeLogo from '../../assets/images/experience/tangiblee_logo.svg';
import radiusLogo from '../../assets/images/experience/radius_logo.png';
import twidLogo from '../../assets/images/experience/twid_logo.png';

class ExperienceSection extends React.Component {
  render() {
    return (
      <Section title="Experience">
        <div className="row">
          <ExperienceUnit
            logo={kfpLogo}
            colour="#fff"
            title="KFP Online"
            link="https://kfponline.com.au/"
            timeperiod="2018"
            subtitle="Built platform for both KFP and AKT study to simulate the real exam."
          />
          <ExperienceUnit
            logo={tangibleeLogo}
            colour="#fff"
            title="Tangiblee"
            link="https://tangiblee.com/"
            timeperiod="2017"
            subtitle="Translated an e-Commerce optimization service from Angular to React."
          />
          <ExperienceUnit
            logo={radiusLogo}
            colour="#fe5c00"
            title="Radius"
            link="https://radius.im/en"
            timeperiod="2016"
            subtitle="Worked as a Front End developer on a desktop messenger based on ElecntronJS. Translate message feed from Angular to WebComponents."
          />
          <ExperienceUnit
            logo={twidLogo}
            colour="#f47920"
            title="Twid"
            link="https://www.twid.com/"
            timeperiod="2015"
            subtitle="Built a web page constructor. Worked in team.
            Integration of 3rd party APIs."
          />
        </div>
      </Section>
    );
  }
}

export default ExperienceSection;
