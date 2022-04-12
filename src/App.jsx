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

      setExclusions({...exclusions})
      setData({id: res?.data?.id, name, description, prediction, attributes});
      const att = {};
      attributes.map(a => att[a.name] = '');
      setModelForm({
        input: {
          [prediction.name]: '',
          ...att
        }
      });

    })
  }

  useEffect(() => {
    getData2();
  }, [])

  const checkDecisionError = () => {
    let errors = {...Errors};
    let {rules} = Exclusions;
    const form = {...ModelForm};
    let isValid = true;
    rules.forEach(rule => {
      const {antecedent, consequent, relation, type} = rule;
      if(type === "RelationshipEx") {
        const formIndex = `INPUTVAR${relation.index + 1}`;
        const val = +form.input[formIndex]
        if(val > relation.threshold ) {
          const question = Data.attributes.filter(attr => attr.name === formIndex)[0].question;
          console.log({[formIndex]: `${question} must be less than ${relation.threshold}`})
          errors[formIndex] = `${question} must be less than ${relation.threshold}`;
          isValid = false;
        }else {
          errors[formIndex] = null;
        }
      }else if(type === "ValueEx") {
        // EQ
        antecedent.forEach((a, i) => {
          const antId = `INPUTVAR${a.index + 1}`;
          const consId =`INPUTVAR${consequent[i].index + 1}`
          const antVal = form.input[antId];
          const consVal = form.input[consId]
          const question1 = Data.attributes.filter(attr => attr.name === antId)[0].question;
          // const question2 = Data.attributes.filter(attr => attr.name === consId)[0].question;
          
          if(antVal && consVal && a.threshold === antVal && a.type === 'EQ') {
            if(consequent[i].threshold === consVal && consequent[i].type === 'EQ') {
              errors[consId] = '';
            }else {
              errors[consId] =  `${consequent[i].threshold} is only applicable for ${question1} : ${antecedent[i].threshold}`;
              isValid = false;
            }
          }
          
          if(antVal && consVal && a.threshold !== antVal && a.type === 'NEQ') {
            if(consequent[i].threshold !== consVal && consequent[i].type === 'NEQ') {
              errors[consId] = '';
            }else {
              errors[consId] =  `${consequent[i].threshold} is only applicable for ${question1} : ${antecedent[i].threshold}`;
              isValid = false;
            }
          }


        });
        
      }
    })

    setErrors({...errors});
    return isValid;
  }

  const validateForm = () => {
    const {input} = ModelForm;
    let errors = {...Errors};
    let isValid = true;
    Object.entries(input).forEach((entries, index) => {
      let [key, val] = entries;
      if(!val) {
        errors[key] = 'This field is required';
        isValid = false;
      }
    });
    setErrors({...errors});
    return isValid;
  }

  const handleChange = (e) => {
    const {name, value} = e.target;
    const form = {...ModelForm};
    form.input[name] = value;
    checkDecisionError();
    setModelForm({...form});
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const {input} = ModelForm;
    if(!checkDecisionError() || !validateForm()) {
      return;
    }

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

  return (
    <div className="App">
      <a href="https://www.flaticon.com/free-icons/api" title="api icons">Api icons created by Freepik - Flaticon</a>
      <header>
        <img src="/images/api.png" alt="Api logo" />
        <h1>{Data?.name}</h1>
        <p>{Data?.description}</p>
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
            {Errors[Data?.prediction?.name] && <span className='error'>{Errors[Data?.prediction?.name]}</span>}
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
                    value={ModelForm.input[item.name] || 0}
                    name={item.name}
                    type="range"
                    min={item.domain.lower}
                    max={item.domain.upper}
                    step={item.domain.interval}
                    className="transition duration-150 ease-in-out"
                    data-bs-toggle="tooltip" title={ModelForm.input[item.name] || 0}
                  />
                  <i className='end index'>{item.domain.upper}</i>
                  {Errors[item.name] && <span className='error'>{Errors[item.name]}</span>}
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


