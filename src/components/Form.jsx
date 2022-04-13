import React from 'react'

export default function Form({Data, Errors, ModelForm, handleChange, handleSubmit}) {
  return (
    <form onSubmit={handleSubmit}
                className="max-w-7xl mx-auto py-6 px-6 lg:px-8"
                noValidate>
            <div className="grid sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8">
              {Data?.prediction && 
                <div className="form-group"> 
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
                  <i className="bar"></i>
                  <label htmlFor={Data?.prediction?.name} className='control-label'>{Data?.prediction?.question}</label>
                  {Errors[Data?.prediction?.name] && <span className='error'>{Errors[Data?.prediction?.name]}</span>}
                </div>
              }
              {Data?.attributes?.map((item, index) => {
                  return (
                    <div className="form-group" key={index}>
                      
                      {item.domain.type === 'DomainR' && 
                      <>
                        <i className='start index'>{item.domain.lower}</i>
                        <i className='end index float-right'>{item.domain.upper}</i>
                        <input 
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
                        <i className="bar"></i>
                      </>
                      }
                      <label htmlFor={item.name} className='control-label'>{item.question}</label>
                      {Errors[item.name] && <span className='error'>{Errors[item.name]}</span>}
                    </div>
                  )
              })}

            </div>
            {Data.prediction && 
              <button type="submit" className='bg-blue-500 hover:bg-blue-600 float-right px-3 py-1'>Submit &gt; </button>
            }
            {!Data?.prediction && 
              <button type="button" className='bg-blue-200 text-gray-700 pointer-events-none float-right px-3 py-1'>Submit &gt; </button>
            }
            
          
          </form>
  )
}
