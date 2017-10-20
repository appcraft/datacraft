import React, {Component, PureComponent} from 'react'
import {render} from 'react-dom'

import { AutoSizer }  from 'react-virtualized';
import cn from 'classnames';

import 'react-virtualized/styles.css';
import './styles.css'

import profiles from './mock'

const fields = [
  {name: '', key: '_index', type: "index", width: 40, locked: true},
  {name: '📷', key: 'thumbnail', type: "thumbnail", width: 30, locked: true},
  {name: 'First Name', key: 'firstName', width: 120, locked: true, editable: true},
  {name: 'Last Name', key: 'lastName', width: 120, locked: true, editable: true},
  {name: 'Email', key: 'email', width: 200, editable: true},
  {name: 'Username', key: 'username', width: 150, editable: true},
  {name: 'Password', key: 'password', width: 150, editable: true},
  {name: 'Phone Number', key: 'phone', width: 150, editable: true},
  {name: 'Nat', key: 'nat', width: 60, editable: true},
  {name: 'Location', key: 'location', width: 400, editable: true},
]

import { DataTable } from '../../src'

// selectBy: {indexes: [0, 1, 2]}
class Demo extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      fields: [...fields],
      data: [...profiles],
      rowHeight: 30,
      selectedIds: {}
    };
  }

  handleAddColumn = () => {
    const { fields } = this.state
    console.log("add column !!")
    this.setState({
      fields: [...fields, {name: "Column " + (fields.length+1), width: 100, key: "column-" + (fields.length+1)}]
    })
  }
  
  _areAllSelected = () => {
    const { selectedIds } = this.state
    for(var line of profiles){
      if (!selectedIds[line.email]) return false
    }
    return true
  }

  _toggleAllSelected = (e) => {
    // e.preventDefault()

    if (this._areAllSelected()){
      this.setState({ selectedIds: {}})
    } else {
      const selectedIds = {}
      for(var line of profiles){
        selectedIds[line.email] = true
      }
      this.setState({selectedIds})
    }
  }

  _toggleSelected = (rows, checked) => {
    const selectedIds = {...this.state.selectedIds}
    console.log("toggle", rows, checked)
    if (checked){
      for(var row of rows){
        selectedIds[profiles[row].email] = true
      }
    } else {
      for(var row of rows){
        delete selectedIds[profiles[row].email]
      }
    }
    this.setState({ selectedIds })
  }

  _addRow = () => {
    this.setState({
      data: [
        ...this.state.data,
        {}
      ]
    })
  }

  render() {
    const {
      rowHeight,
      selectedIds,
      fields,
      data
    } = this.state;

    return (
      <div style={{padding: 8, height: '100%', display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: 8}}>{data.length} profiles</div>
        <div style={{flex: '1 1 auto', display: 'flex', flexDirection: 'column'}}>
          <AutoSizer disableWidth>
            {({height}) => (
                <DataTable 
                  height={height} 
                  selectable={true}
                  data={data}
                  fields={fields}
                  onAddRow={this._addRow}
                  onRowsSelected={this._toggleSelected}
                  onAllSelected={this._toggleAllSelected}
                  onAddColumn={this.handleAddColumn}
                  selectedIds={selectedIds} />
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }
}

/**
 * Ported from sass implementation in C
 * https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
 */


render(<Demo/>, document.querySelector('#demo'))
