import React, { Component } from 'react';
import pstyles from './pcsss/app.pcss'
import { Button } from 'antd';
import 'antd/lib/button/style/css';        // 加载 CSS

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab,far,fas,fal } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faCoffee } from '@fortawesome/free-solid-svg-icons'
library.add(fab, faCheckSquare, faCoffee)

export const Gadget = () => (
  <div>
    <FontAwesomeIcon icon={['fas','check-square']} />
    Popular gadgets come from vendors like:
    <FontAwesomeIcon icon={['fab', 'apple']} />
    <FontAwesomeIcon icon={['fab', 'microsoft']} />
    <FontAwesomeIcon icon={['fab', 'google']} />
  </div>
)

class App extends Component {
  render() {
    require.ensure(['axios'],function(){
      const _ = require('axios')
      console.log(_)
    },'vendor')
    return (
      <div className={ pstyles.cont }>
      <Button type='primary'>test button</Button>
        <span className={ pstyles.top }>first react demo</span>
        <span className={ pstyles.bottom }>test text</span>
        <Gadget />
      </div>
    );
  }
}

export default App;
