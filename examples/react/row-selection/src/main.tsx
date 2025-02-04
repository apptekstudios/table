import React, { HTMLAttributes, HTMLProps } from 'react'
import ReactDOM from 'react-dom'

import './index.css'

import { makeData, Person } from './makeData'

import {
  Column,
  createTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  TableInstance,
  useTableInstance,
} from '@tanstack/react-table'

let table = createTable().setRowType<Person>()

function App() {
  const rerender = React.useReducer(() => ({}), {})[1]

  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columns = React.useMemo(
    () => [
      table.createDisplayColumn({
        id: 'select',
        header: ({ instance }) => (
          <IndeterminateCheckbox
            {...{
              checked: instance.getIsAllRowsSelected(),
              indeterminate: instance.getIsSomeRowsSelected(),
              onChange: instance.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      }),
      table.createGroup({
        header: 'Name',
        footer: props => props.column.id,
        columns: [
          table.createDataColumn('firstName', {
            cell: info => info.getValue(),
            footer: props => props.column.id,
          }),
          table.createDataColumn(row => row.lastName, {
            id: 'lastName',
            cell: info => info.getValue(),
            header: () => <span>Last Name</span>,
            footer: props => props.column.id,
          }),
        ],
      }),
      table.createGroup({
        header: 'Info',
        footer: props => props.column.id,
        columns: [
          table.createDataColumn('age', {
            header: () => 'Age',
            footer: props => props.column.id,
          }),
          table.createGroup({
            header: 'More Info',
            columns: [
              table.createDataColumn('visits', {
                header: () => <span>Visits</span>,
                footer: props => props.column.id,
              }),
              table.createDataColumn('status', {
                header: 'Status',
                footer: props => props.column.id,
              }),
              table.createDataColumn('progress', {
                header: 'Profile Progress',
                footer: props => props.column.id,
              }),
            ],
          }),
        ],
      }),
    ],
    []
  )

  const [data, setData] = React.useState(() => makeData(100000))
  const refreshData = () => setData(() => makeData(100000))

  const instance = useTableInstance(table, {
    data,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  })

  return (
    <div className="p-2">
      <div>
        <input
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          className="p-2 font-lg shadow border border-block"
          placeholder="Search all columns..."
        />
      </div>
      <div className="h-2" />
      <table>
        <thead>
          {instance.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <>
                        {header.renderHeader()}
                        {header.column.getCanFilter() ? (
                          <div>
                            <Filter
                              column={header.column}
                              instance={instance}
                            />
                          </div>
                        ) : null}
                      </>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {instance.getRowModel().rows.map(row => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => {
                  return <td key={cell.id}>{cell.renderCell()}</td>
                })}
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td className="p-1">
              <IndeterminateCheckbox
                {...{
                  checked: instance.getIsAllPageRowsSelected(),
                  indeterminate: instance.getIsSomePageRowsSelected(),
                  onChange: instance.getToggleAllPageRowsSelectedHandler(),
                }}
              />
            </td>
            <td colSpan={20}>
              Page Rows ({instance.getRowModel().rows.length})
            </td>
          </tr>
        </tfoot>
      </table>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => instance.setPageIndex(0)}
          disabled={!instance.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => instance.previousPage()}
          disabled={!instance.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => instance.nextPage()}
          disabled={!instance.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => instance.setPageIndex(instance.getPageCount() - 1)}
          disabled={!instance.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {instance.getState().pagination.pageIndex + 1} of{' '}
            {instance.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={instance.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              instance.setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={instance.getState().pagination.pageSize}
          onChange={e => {
            instance.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <br />
      <div>
        {Object.keys(rowSelection).length} of{' '}
        {instance.getPreFilteredRowModel().rows.length} Total Rows Selected
      </div>
      <hr />
      <br />
      <div>
        <button className="border rounded p-2 mb-2" onClick={() => rerender()}>
          Force Rerender
        </button>
      </div>
      <div>
        <button
          className="border rounded p-2 mb-2"
          onClick={() => refreshData()}
        >
          Refresh Data
        </button>
      </div>
      <div>
        <button
          className="border rounded p-2 mb-2"
          onClick={() => console.info('rowSelection', rowSelection)}
        >
          Log `rowSelection` state
        </button>
      </div>
      <div>
        <button
          className="border rounded p-2 mb-2"
          onClick={() =>
            console.info(
              'instance.getSelectedFlatRows()',
              instance.getSelectedRowModel().flatRows
            )
          }
        >
          Log instance.getSelectedFlatRows()
        </button>
      </div>
    </div>
  )
}

function Filter({
  column,
  instance,
}: {
  column: Column<any>
  instance: TableInstance<any>
}) {
  const firstValue = instance
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2">
      <input
        type="number"
        value={((column.getFilterValue() as any)?.[0] ?? '') as string}
        onChange={e =>
          column.setFilterValue((old: any) => [e.target.value, old?.[1]])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        value={((column.getFilterValue() as any)?.[1] ?? '') as string}
        onChange={e =>
          column.setFilterValue((old: any) => [old?.[0], e.target.value])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <input
      type="text"
      value={(column.getFilterValue() ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
      className="w-36 border shadow rounded"
    />
  )
}

function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!)

  React.useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
