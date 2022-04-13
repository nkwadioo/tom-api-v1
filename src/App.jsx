import React, { useState, useEffect, Fragment  } from 'react';
import Nav from './components/Nav';
import Form from './components/Form';
import Alerts from './components/Alerts';
import './App.css';


function App() {
  const [Data, setData] = useState([])
  const [Models, setModels] = useState({})
  const [ModelId, setModelId] = useState('')
  const [ModelForm, setModelForm] = useState({input: {}})
  const [Exclusions, setExclusions] = useState({rules: {}})
  const [Errors, setErrors] = useState({})
  const [Alert, setAlert] = useState({show: false, message: '', type: ''})

  const url = 'https://api.up2tom.com/v3';

  const showMessage = (message, type, time = 1400) => {
    setAlert({show: true, message, type})
    setTimeout(() => {
      setAlert({show: false, message: '', type: null})
    }, time)
  }

  const getModels = () => {
    fetch(`${url}/models`, {
      method: 'GET',
      mode: 'cors',
      crossDomain:true,
      headers: {
        'Authorization': 'Token 9307bfd5fa011428ff198bb37547f979',
        'Content-type': 'application/vnd.api+json'
      }
    }).then((res) => res.json())
    .then((res) => {
      if(res.error || res.errors || !res.data) {
        showMessage('Error loading models', 'error');
        return;
      }
      setModels([...res.data])
    });
  }

  const getModelData = (event) => {
    const {value} = event.target;
    setData([])

    getData2(value);
  }

  

  const getData2 = (modelId) => {
    // try {
      if(!modelId) {
        return;
      }
      fetch(`${url}/models/${modelId}`, {
        method: 'GET',
        mode: 'cors',
        crossDomain:true,
        headers: {
          'Authorization': 'Token 9307bfd5fa011428ff198bb37547f979',
          'Content-type': 'application/vnd.api+json'
        }
      })
      .then((res) => res.json())
      .then((res) => {
        if(res.error || res.errors || !res.data) {
          showMessage('Error loading model data', 'error');
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
        attributes.map(a => att[a.name] = a.domain.type === 'DomainR' ? 
          (a.domain.lower < 0 ? 0 : a.domain.lower) :
          '');
        setModelId(modelId);
        setModelForm({
          input: {
            [prediction.name]: '',
            ...att
          }
        });

        showMessage('Model loaded successfully', 'success');

      })   
    // } catch (err) {
      
    // }
  }

  useEffect(() => {
    getModels();
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
  
  const checkValue = (e) => {
    const {name, value} = e.target;
    if(!value && value !== 0) {
      setErrors({[name]: 'This field is required'});
    }else {
      setErrors({[name]: null});
    }
  }

  const validateForm = () => {
    const {input} = ModelForm;
    let errors = {...Errors};
    let isValid = true;
   
    Object.entries(input).forEach((entries, index) => {
      let [key, val] = entries;
      if(!val && val !== 0) {
        errors[key] = 'This field is required';
        isValid = false;
      }else {
        errors[key] = null;
      }
    });
    setErrors({...errors});
    return isValid;
  }

  const handleChange = (e) => {
    const {name, value} = e.target;
    const form = {...ModelForm};
    form.input[name] = value;
    
    checkValue(e)
    checkDecisionError();
    setModelForm({...form});
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const {input} = ModelForm;
    if(!checkDecisionError() || !validateForm()) {
      showMessage('Please fill all the required fields', 'error');
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
    fetch(`${url}/decision/${ModelId}`, {
      method: 'POST',
      mode: 'cors',
      crossDomain:true,
      headers: {
        'Authorization': 'Token 9307bfd5fa011428ff198bb37547f979',
        'Content-type': 'application/vnd.api+json'
      },
      body: JSON.stringify(data)
    })
    .then((res) => res.json())
    .then((res) => {
      if(res.error || res.errors) {
        showMessage('Unable to submit model', 'error');
        return;
      }
      showMessage('Model submitted successfully', 'success');
      console.log(res);
    })
  }

  const handleBlur = (e) => {
    validateForm(e.target.name);
  }

  return (
    <div className="App">
      <Alerts Alert={Alert} />
      <Nav />
      <header className="lg:container mx-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <form className="sm:w-6/12 w-full mx-auto">
            <div className="form-group">
              <select name="prediction" onChange={getModelData}>
                <option value="">Select Model</option>
                {Models.length && 
                  Models.map((model, index) => {
                    return (
                      <option value={model.id} key={index}>{model.attributes?.name}</option>
                    )
                  })
                }
              </select>
              <label htmlFor="prediction" className='control-label'>Prediction name</label> 
              <i className="bar"></i>
            </div>
            <span className='font-thin'>{Data.description}</span>
          </form>
        </div>
      </header>
      <div className="min-h-full">
        
        <main className="lg:container mx-auto">
          <Form Data={Data} Errors={Errors} ModelForm={ModelForm} handleChange={handleChange} handleSubmit={handleSubmit} />
        </main>
      </div>
      <a href="https://www.flaticon.com/free-icons/api" title="api icons">Api icons created by Freepik - Flaticon</a>
    </div>

    
  );
}

export default App;


