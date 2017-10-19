import React, {Component, PureComponent} from 'react'
import {render} from 'react-dom'

import { AutoSizer, Grid, ScrollSync }  from 'react-virtualized';
import cn from 'classnames';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';

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

class DataTable extends PureComponent {
  static defaultProps = {
    selectable: false
  }

  constructor(props, context) {
    super(props, context);

    this.latestSelection = null
    this.state = {
      // scrollToEnd: false
    }

    this._cache = {}

    this._renderBodyCell = this._renderBodyCell.bind(this);
    this._renderHeaderCell = this._renderHeaderCell.bind(this);
    this._renderLeftSideCell = this._renderLeftSideCell.bind(this);
  }
  
  handleAddColumn = () => {
    const { fields, onAddColumn } = this.props
    if (onAddColumn){
      onAddColumn()
      setTimeout(() => {
        // this._rightGrid.recomputeGridSize({columnIndex: fields.length-2})
        this._rightGrid.scrollToCell({columnIndex: fields.length+1})
        this._rightGrid.recomputeGridSize()
      }, 100)
    }
  }

  handleAddRow = () => {
    const { data, onAddRow } = this.props
    const newRow = data.length+1
    if (onAddRow){
      onAddRow()
      setTimeout(() => {
        this._rightGrid.scrollToCell({rowIndex: newRow})
        // this.setState({ scrollToEnd: true })
        // console.log(this._rightGrid)
      }, 100)
    }
  }

  handleRowSelected = (e, rowIndex) => {
    const { data, selectedIds, onRowsSelected } = this.props
    if (onRowsSelected){
      console.log(e.shiftKey, this.latestSelection)
      if (e.shiftKey && this.latestSelection !== null){
        // Multi row selection
        console.log("shift !!!")
        const rows = []
        if (rowIndex < this.latestSelection){
          for(var i=rowIndex; i<= this.latestSelection; i++) {
            rows.push(i)
          }
        } else {
          for(var i=this.latestSelection; i<=rowIndex; i++) {
            rows.push(i)
          }
        }
        this.latestSelection = rowIndex
        onRowsSelected(rows, true) // Force on
      } else { 
        // Single row selection
        if (this._isSelected({rowIndex})){
          this.latestSelection = null
        } else {
          this.latestSelection = rowIndex
        }
        onRowsSelected([rowIndex], !selectedIds[data[rowIndex].email])
      }
    }
  }
  
  _areAllSelected = () => {
    const { selectedIds, data } = this.props
    for(var line of data){
      if (!selectedIds[line.email]) return false
    }
    return true
  }

  _isSelected = ({rowIndex}) => {
    const { selectedIds, data } = this.props
    if (!selectedIds) return false
    return selectedIds[data[rowIndex].email]
  }
  
  getColumnWidth = ({index}) => {
    const { fields } = this.props

    
    if (index >= fields.length) console.log("getColumnWidth", index, 40)
    else console.log("getColumnWidth", index, fields[index].width || 75)

    if (index >= fields.length) return 40 // Add column
    return fields[index].width || 75
  }
  
  _computeLeftWidth = () => {
    const { fields } = this.props
    let width = 0
    for(var field of fields){
      if (field.locked){
        width += field.width || 75
      } else {
        break
      }
    }
    return width
  }
  
  // _computeCellLeft = (columnIndex) => {
  //   let width = 0
  //   for(var index=0; index<columnIndex && index<fields.length; index++){
  //     width += fields[index].width || 75
  //   }
  //   return width
  // }
  
  // computeColumnSize = () => {
  //   const { fields, onAddColumn } = this.props
  //   let count = fields.length
  //   if (onAddColumn) count++
  //   let width = 0
  //   for(var index=0; index<count; index++) {
  //     width += this.getColumnWidth({index})
  //   }
  //   return width
  // }

  _computeFixedCount = () => {
    const { fields } = this.props
    let cnt = 0
    for(var field of fields){
      if (field.locked){
        cnt++
      } else {
        break
      }
    }
    return cnt
  }

  render(){
    const { height, fields,
      overscanColumnCount=5,
      overscanRowCount=5 ,
      rowHeight=30,
      selectedIds,
      data,
      onAddColumn,
    } = this.props

    const { scrollToEnd } = this.state

    
    let columnCount = fields.length
    if (onAddColumn) columnCount++
    const rowCount = data.length + 1

    console.log("selectedIds", selectedIds)

    // const estimatedColumnSize = this.computeColumnSize()
    // console.log("estimatedColumnSize", estimatedColumnSize)

    return (
      <ScrollSync>
      {({
        clientHeight,
        clientWidth,
        onScroll,
        scrollHeight,
        scrollLeft,
        scrollTop,
        scrollWidth,
      }) => {
        const x = scrollLeft / (scrollWidth - clientWidth);
        const y = scrollTop / (scrollHeight - clientHeight);

        return (
          <div className="GridRow">
            <div
              className={cn("LeftSideGridContainer", {"over": scrollLeft > 0.1})}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
              }}>
              <Grid
                cellRenderer={this._renderLeftHeaderCell}
                className="HeaderGrid"
                width={this._computeLeftWidth()}
                height={rowHeight}
                rowHeight={rowHeight}
                columnWidth={this.getColumnWidth}
                rowCount={1}
                columnCount={this._computeFixedCount()}
                fields={fields}
                selectedIds={selectedIds}
                data={data}
              />
            </div>
            <div
              className={cn("LeftSideGridContainer", {"over": scrollLeft > 0.1})}
              style={{
                position: 'absolute',
                left: 0,
                top: rowHeight,
              }}>
              <Grid
                overscanColumnCount={overscanColumnCount}
                overscanRowCount={overscanRowCount}
                cellRenderer={this._renderLeftSideCell}
                columnWidth={this.getColumnWidth}
                columnCount={this._computeFixedCount()}
                className="LeftSideGrid"
                height={height - scrollbarSize()}
                rowHeight={rowHeight}
                rowCount={rowCount}
                scrollTop={scrollTop}
                width={this._computeLeftWidth()}
                fields={fields}
                selectedIds={selectedIds}
                data={data}
              />
            </div>
            <div className="GridColumn">
              <AutoSizer disableHeight>
                {({width}) => (
                  <div>
                    <div
                      style={{
                        height: rowHeight,
                        width: width - scrollbarSize(),
                      }}>
                      <Grid
                        className="HeaderGrid"
                        columnWidth={this.getColumnWidth}
                        columnCount={columnCount}
                        height={rowHeight}
                        overscanColumnCount={overscanColumnCount}
                        cellRenderer={this._renderHeaderCell}
                        rowHeight={rowHeight}
                        rowCount={1}
                        scrollLeft={scrollLeft}
                        fields={fields}
                        width={width - scrollbarSize()}
                        selectedIds={selectedIds}
                        data={data}
                      />
                    </div>
                    <div
                      style={{
                        height,
                        width,
                      }}>
                      <Grid
                        ref={el => this._rightGrid = el}
                        className="BodyGrid"
                        columnWidth={this.getColumnWidth}
                        columnCount={columnCount}
                        height={height}
                        onScroll={onScroll}
                        scrollTop={scrollTop}
                        overscanColumnCount={overscanColumnCount}
                        overscanRowCount={overscanRowCount}
                        cellRenderer={this._renderBodyCell}
                        rowHeight={rowHeight}
                        rowCount={rowCount}
                        width={width}
                        fields={fields}
                        selectedIds={selectedIds}
                        data={data}
                      />
                    </div>
                  </div>
                )}
              </AutoSizer>
            </div>
          </div>
        );
      }}
    </ScrollSync>
    )
  }

  _renderBodyCell({columnIndex, key, rowIndex, style}) {
    if (columnIndex < this._computeFixedCount()) {
      return;
    }
    return this._renderLeftSideCell({columnIndex, key, rowIndex, style});
  }

  _renderHeaderCell({columnIndex, key, rowIndex, style}) {
    if (columnIndex < this._computeFixedCount()) {
      return;
    }
    return this._renderLeftHeaderCell({columnIndex, key, rowIndex, style});
  }
  
  // fixStyleForCell = (columnIndex, style) => {
  //   if (columnIndex >= this._computeFixedCount()) {
  //     return style; // unchanged
  //   }
  //   // Snap left
  //   return {
  //     ...style,
  //     left: this._computeCellLeft(columnIndex)
  //   }
  // }

  _renderLeftHeaderCell = ({columnIndex, key, style}) => {
    const { selectable, fields, onAllSelected } = this.props

    // style = this.fixStyleForCell(columnIndex, style)
    if (columnIndex === 0){
      return (
        <div className="headerCell" key={key} style={style}>
          {selectable ? (
            <div className="headerCell__checkbox">
              <label>
                <input type="checkbox" checked={this._areAllSelected()} onChange={onAllSelected}  />
              </label>
            </div>
          ) : (
            <div className="headerCell__checkbox">#</div>
          )}
        </div>
      )
    } else if (columnIndex === fields.length){
      // Found add column !
      return (
        <div className="headerCell headerCell--add" key={key} style={style} onClick={this.handleAddColumn}>
          <div>＋</div>
        </div>
      )
    }
    let className = "headerCell"
    if (columnIndex === this._computeFixedCount()-1){
      className += " headerCell--right-separator"
    }

    return (
      <div className={className} key={key} style={style}>
        {`${fields[columnIndex].name}`}
      </div>
    );
  }

  _renderLeftSideCell({columnIndex, key, rowIndex, style}) {
    const { fields, data, selectable } = this.props
    let className = "cell"

    if (columnIndex === fields.length){
      // Found add column !
      return (
        <div className={className + " cell--add-column"} key={key} style={style} /> // Empty cell :p   
      )
    }

    const field = fields[columnIndex]
    if (columnIndex === this._computeFixedCount()-1){
      className += " cell--right-separator"
    }

    if (rowIndex >= data.length){
      // + entry
      if (field.key === '_index'){
        return (
          <div className={className + " cell--add"} key={key} style={style}
               onClick={this.handleAddRow}>
            <div className="cell__index">
            ＋
            </div>
          </div>
        )
      } else {
        return (
          <div className={className + " cell--empty"} 
               onClick={this.handleAddRow}
               key={key} style={style}></div>
        )
      }
    }

    const isSelected = !!this._isSelected({rowIndex})

    // style = this.fixStyleForCell(columnIndex, style)
    if (field.key === '_index'){
      return (
        <div className={cn(className + " cell--type-index", {"cell--selectable": selectable, "cell--selected": isSelected})}  key={key} style={style}>
          <div className="cell__index">
            {`${rowIndex+1}`}
          </div>
          {selectable && <div className="cell__checkbox">
            <label>
              <input type="checkbox" checked={isSelected} onClick={e => this.handleRowSelected(e, rowIndex)} />
            </label>
          </div>}
        </div>
      )
    } 
    
    if (field.type === 'thumbnail'){
      return (
        <div className={cn(className + " cell--type-" + field.type, {"cell--selected": isSelected})} key={key} style={style}>
          <img src={data[rowIndex][field.key]} alt="" />
        </div>
      )
    }
    return (
      <div className={cn(className, {"cell--selected": isSelected})} key={key} style={style}>
        {data[rowIndex][field.key]}
      </div>
    );
  }  
}

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
      <div>
      <div style={{padding: 8}}>{data.length} profiles</div>
        <DataTable height={500} 
                   selectable={true}
                   data={data}
                   fields={fields}
                   onAddRow={this._addRow}
                   onRowsSelected={this._toggleSelected}
                   onAllSelected={this._toggleAllSelected}
                   onAddColumn={this.handleAddColumn}
                   selectedIds={selectedIds} />
      </div>
    );
  }
}

/**
 * Ported from sass implementation in C
 * https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
 */


render(<Demo/>, document.querySelector('#demo'))
