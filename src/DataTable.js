import React, {Component, PureComponent} from 'react'

import { AutoSizer, Grid, ScrollSync }  from 'react-virtualized';
import cn from 'classnames';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';

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

  componentDidMount(){
    this._isMounted = true
  }

  componentWillUnmount(){
    this._isMounted = false
  }

  componentWillUpdate(nextProps, nextState) {
    // Check for your update condition however you need to...
    if (nextProps.fields !== this.props.fields) {
      if (this._rightGrid && this._rightHeaderGrid) {
        this._rightGrid.recomputeGridSize()
        this._rightHeaderGrid.recomputeGridSize()
      }
    }
  }

  // Safe unmount timeout implementation
  setTimeout = (callback, timeout) => {
    setTimeout(() => {
      if (!this._isMounted) return
      callback()
    }, timeout)
  }
  
  scrollToBottom = () => {
    const { data } = this.props
    if (this._rightGrid && data){
      this._rightGrid.scrollToCell({rowIndex: data.length})
    }
  }
  
  scrollToRight = () => {
    const { fields } = this.props
    if (this._rightGrid && fields){
      this._rightGrid.scrollToCell({columnIndex: fields.length})
    }
  }
  
  handleAddColumn = () => {
    const { fields, onAddColumn } = this.props
    if (onAddColumn) onAddColumn()
    // this._rightGrid.recomputeGridSize({columnIndex: fields.length-2})
  }

  handleAddRow = () => {
    const { data, onAddRow } = this.props
    const newRow = data.length+1
    if (onAddRow) onAddRow()
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
  
  handleMouseWheel = (e) => {
    console.log("handleMouseWheel", e)
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

    if (index >= fields.length) return 60 // Add column
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
      overscanRowCount=10,
      rowHeight=30,
      selectedIds,
      data,
      onAddColumn,
    } = this.props

    const { scrollToEnd } = this.state


    console.log("height", height)
    
    let columnCount = fields.length
    if (onAddColumn) columnCount++
    const rowCount = data.length + 1

    // console.log("selectedIds", selectedIds)

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

        console.log("scrollLeft", scrollLeft)

        const contentHeight = height - rowHeight

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
                height={contentHeight - scrollbarSize()}
                rowHeight={rowHeight}
                rowCount={rowCount}
                onScroll={e => {onScroll({ // Clone scroll event and only keep scrollTop
                  clientHeight, clientWidth, scrollHeight, scrollWidth,
                  scrollLeft, scrollTop: e.scrollTop
                })}}
                scrollTop={scrollTop}
                onMouseWheel={this.handleMouseWheel}
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
                        ref={el => this._rightHeaderGrid = el}
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
                        height: contentHeight,
                        width,
                      }}>
                      <Grid
                        ref={el => this._rightGrid = el}
                        className="BodyGrid"
                        columnWidth={this.getColumnWidth}
                        columnCount={columnCount}
                        height={contentHeight}
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

export default DataTable