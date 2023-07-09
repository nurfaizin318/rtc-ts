
import { Routes, Route } from 'react-router-dom';

import Home from "../Page/Home"
import Stream from "../Page/Stream"
import Watch from "../Page/Watch"

const  Routing = () => {

    return (

  
        <Routes>
          <Route path="/" element={<Home />} />
          <Route  path="/stream" element={<Stream  />} />
          <Route  path="/watch/:room" element={<Watch  />} />
        </Routes>

    );
  }


  export default Routing;