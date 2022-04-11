import React, { useState, useEffect } from 'react'
import './App.css';
import source from './data.js';

// class App extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {input: {}}
//   }
// }

function App() {
  const [Data, setData] = useState({})
  const [ModelForm, setModelForm] = useState({input: {}})
  const [Exclusions, setExclusions] = useState({rules: {}})
  const [Errors, setErrors] = useState({})

  // fetch('https://api.up2tom.com/v3/models', {
  //       crossDomain:true,
  //       method: 'GET',
  //       headers: { 
  //         'Authorization': 'Token 9307bfd5fa011428ff198bb37547f979',
  //         'contentType': 'application/vnd.api+json'
  //       },
  //     })
  
  const getData2 = () => {
    try {
      
    } catch (err) {
      
    }
    fetch('/v3/models/58d3bcf97c6b1644db73ad12', {
      method: 'GET',
      headers: { 
        'Authorization': 'Token 9307bfd5fa011428ff198bb37547f979',
        'contentType': 'application/vnd.api+json',
      },
    })
    .then((res) => res.json())
    .then((res) => {
      if(res.error || res.errors || !res.data) {
        return;
      }
      const model = {...res?.data?.attributes};
      const name = model.name;
      const description = model.description;
      const exclusions = model.exclusions;
      const metadata = model.metadata;
      const prediction = metadata.prediction;
      const attributes = metadata.attributes;

      setData({id: res?.data?.id, name, description, prediction, attributes});
      setExclusions({...exclusions})
    })
  }

  useEffect(() => {
    getData2();
  }, [])

  const handleChange = (e) => {
    const {name, value} = e.target;
    const form = {...ModelForm};
    form.input[name] = value;
    let {rules} = Exclusions;
    let index = +name.split('INPUTVAR')[1];
    let errors = {...Errors};
    rules.forEach(rule => {
      const {antecedent, consequent, relation} = rule;
      if(rule.type === "RelationshipEx") {
        const val = +form.input[`INPUTVAR${relation.index + 1}`]
        if(val > relation.threshold ) {
          const question = Data.attributes.filter(attr => attr.name === `INPUTVAR${relation.index + 1}`)[0].question;
          console.log({[`INPUTVAR${relation.index + 1}`]: `${question} must be less than ${relation.threshold}`})
          errors[`INPUTVAR${relation.index + 1}`] = `${question} must be less than ${relation.threshold}`
        }else {
          errors[`INPUTVAR${relation.index + 1}`] = null;
        }
      }else if(rule.type === "ValueEx") {
        // EQ
        antecedent.forEach((a, i) => {
          const antVal = form.input[`INPUTVAR${a.index + 1}`];
          const consVal = form.input[`INPUTVAR${consequent[i].index + 1}`]
          const question1 = Data.attributes.filter(attr => attr.name === `INPUTVAR${a.index + 1}`)[0].question;
          // const question2 = Data.attributes.filter(attr => attr.name === `INPUTVAR${consequent[i].index + 1}`)[0].question;
          
          if(antVal && consVal && a.threshold === antVal && a.type === 'EQ') {
            if(consequent[i].threshold === consVal && consequent[i].type === 'EQ') {
              errors[`INPUTVAR${consequent[i].index + 1}`] =  `${consequent[i].threshold} is only applicable for ${question1} : ${antecedent[i].threshold}`;
            }else {
              errors[`INPUTVAR${consequent[i].index + 1}`] = '';
            }
          }else
          if(antVal && consVal && a.threshold !== antVal && a.type === 'NEQ') {
            if(consequent[i].threshold !== consVal && consequent[i].type === 'NEQ') {
              errors[`INPUTVAR${consequent[i].index + 1}`] =  `${consequent[i].threshold} is only applicable for ${question1} : ${antecedent[i].threshold}`;
            }else {
              errors[`INPUTVAR${consequent[i].index + 1}`] = '';
            }
          }
        });
        
      }
    })
    setModelForm({...ModelForm, ...form});
    setErrors({...Errors, ...errors});
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const {input} = ModelForm;
    debugger
    const data = {
      data: {
        type: 'scenario',
        attributes: {
          input
        }
      }
    }
    fetch('/v3/decision/58d3bcf97c6b1644db73ad12', {
      method: 'POST',
      headers: { 
        'Authorization': 'Token 9307bfd5fa011428ff198bb37547f979',
        'contentType': 'application/vnd.api+json',
      },
      contentType: 'application/vnd.api+json',
      body: JSON.stringify(data)
    })
    .then((res) => res.json())
    .then((res) => {
      if(res.error || res.errors) {
        return;
      }
      console.log(res);
    })
  }

  
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
        <h1>{Data?.name}</h1>
      </header>
      <form onSubmit={handleSubmit} noValidate>
        {Data?.prediction && 
          <div>
            <label>{Data?.prediction?.question}</label>
            {Data?.prediction?.domain?.type === 'DomainC' && 
              <select required name={Data?.prediction?.name}
                      value={ModelForm.input[Data?.prediction?.name]}
                      onChange={handleChange}>
                <option value="">Select Option</option>
                {Data?.prediction?.domain.values.map((v, i) => {
                  return <option key={i} value={v}>{v}</option>
                })}
              </select>
            }
          </div>
        }
        {Data?.attributes?.map((item, index) => {
            return (
              <div key={index}>
                <label>{item.question}</label>
                {item.domain.type === 'DomainR' && 
                <>
                  <i className='start index'>{item.domain.lower}</i>
                  <input 
                    required
                    onChange={handleChange}
                    value={ModelForm.input[item.name]}
                    name={item.name}
                    type="range"
                    min={item.domain.lower}
                    max={item.domain.upper}
                    step={item.domain.interval}
                  />
                  <i className='end index'>{item.domain.upper}</i>
                  {Errors[item.name] && <span className='error'>{Errors[item.name]}</span>}
                  {/* <span className='invalid-feedback'></span> */}
                </>
                }
                {item.domain.type === 'DomainC' && 
                <>
                  <select required name={item.name} value={ModelForm.input[item.name]} onChange={handleChange}>
                    <option value="">Select Option</option>
                    {item.domain.values.map((v, i) => {
                      return <option key={i} value={v}>{v}</option>
                    })}
                  </select>
                  {Errors[item.name] && <span className='error'>{Errors[item.name]}</span>}
                </>
                }
                {/* <h2>{item.question} - <span>{item.type}</span></h2> */}
              </div>
            )
        })}
        <button type="submit">Submit</button>
       
      </form>
    </div>

    
  );
}

export default App;


