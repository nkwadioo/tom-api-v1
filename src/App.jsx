import React, { useState, useEffect } from 'react'
import './App.css';
import source from './data.js';

function App() {
  // const [Data, fetchData] = useState([])

  // fetch('https://api.up2tom.com/v3/models/58d3bcf97c6b1644db73ad12', {
  //       crossDomain:true,
  //       method: 'GET',
  //       headers: { 
  //         'Authorization': 'Token 9307bfd5fa011428ff198bb37547f979',
  //         'contentType': 'application/vnd.api+json'
  //       },
  //     })
  
  // const getData = () => {
  //   fetch('https://api.up2tom.com/v3/models/', {
  //     crossDomain:true,
  //     method: 'GET',
  //     headers: { 
  //       'Authorization': 'Token 307bfd5fa011428ff198bb37547f979',
  //       'contentType': 'application/vnd.api+json',
  //       'Access-Control-Allow-Origin': '*'
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((res) => {
  //       console.log(res)
  //       fetchData(res)
  //     })
  // }

  // useEffect(() => {
  //   getData()
  // }, [])

  
  // console.log(data)
  const getData = () => {
    const model = source.data.attributes;
    const name = model.name;
    const description = model.description;
    const metadata = model.metadata;
    const prediction = metadata.prediction;
    const attributes = metadata.attributes;
    return { name, description, prediction, attributes }
  }

  return (
    <div className="App">
      <header>
        <h1>{getData().name}</h1>
      </header>
      <form>
        {getData().attributes.map((item, index) => {
            return (
              <div key={index}>
                <label>{item.question}</label>
                {item.domain.type === 'DomainR' && 
                <>
                  <span className='start'>{item.domain.lower}</span>
                  <input 
                    name={item.name}
                    type="range"
                    min={item.domain.lower}
                    max={item.domain.upper}
                    step={item.domain.interval}
                  />
                  <span className='end'>{item.domain.upper}</span>
                </>
                }
                {item.domain.type === 'DomainC' && 
                  // <input name={item.name} type="text" />
                  <select name={item.name}>
                    <option value="">Select Option</option>
                    {item.domain.values.map((v, i) => {
                      return <option key={i} value={v}>{v}</option>
                    })}
                  </select>
                }
                {/* <h2>{item.question} - <span>{item.type}</span></h2> */}
              </div>
            )
        })}
        
       
      </form>
    </div>

    
  );
}

export default App;


