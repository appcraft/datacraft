import React, {Component, PureComponent} from 'react'
import {render} from 'react-dom'

import { AutoSizer, Grid, ScrollSync }  from 'react-virtualized';
import cn from 'classnames';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';

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

    this._renderBodyCell = this._renderBodyCell.bind(this);
    this._renderHeaderCell = this._renderHeaderCell.bind(this);
    this._renderLeftSideCell = this._renderLeftSideCell.bind(this);
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
  
  _getColumnWidth = ({index}) => {
    return fields[index].width || 75
  }
  
  _computeLeftWidth = () => {
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
  
  _computeFixedCount = () => {
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
      overscanColumnCount=0,
      overscanRowCount=5 ,
      rowHeight=30,
      selectedIds,
      data,
    } = this.props

    
    const columnCount = fields.length
    const rowCount = data.length + 1

    console.log("selectedIds", selectedIds)

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
                columnWidth={this._getColumnWidth}
                rowCount={1}
                columnCount={this._computeFixedCount()}
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
                columnWidth={this._getColumnWidth}
                columnCount={this._computeFixedCount()}
                className="LeftSideGrid"
                height={height - scrollbarSize()}
                rowHeight={rowHeight}
                rowCount={rowCount}
                scrollTop={scrollTop}
                width={this._computeLeftWidth()}
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
                        columnWidth={this._getColumnWidth}
                        columnCount={columnCount}
                        height={rowHeight}
                        overscanColumnCount={overscanColumnCount}
                        cellRenderer={this._renderHeaderCell}
                        rowHeight={rowHeight}
                        rowCount={1}
                        scrollLeft={scrollLeft}
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
                        className="BodyGrid"
                        columnWidth={this._getColumnWidth}
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
    const { fields, data, onRowSelected, selectable, onAddRow } = this.props
    const field = fields[columnIndex]

    let className = "cell"
    if (columnIndex === this._computeFixedCount()-1){
      className += " cell--right-separator"
    }

    if (rowIndex >= data.length){
      // + entry
      if (field.key === '_index'){
        return (
          <div className={className + " cell--add"} key={key} style={style}
               onClick={onAddRow}>
            <div className="cell__index">
            ＋
            </div>
          </div>
        )
      } else {
        return (
          <div className={className + " cell--empty"} 
               onClick={onAddRow}
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
              <input type="checkbox" checked={isSelected} onChange={e => onRowSelected(rowIndex)} />
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

  _toggleSelected = (rowIndex) => {
    const { selectedIds } = this.state
    const id = profiles[rowIndex].email
    this.setState({
      selectedIds: {
        ...selectedIds,
        [id]: !selectedIds[id]
      }
    })
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
                   onRowSelected={this._toggleSelected}
                   onAllSelected={this._toggleAllSelected}
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
