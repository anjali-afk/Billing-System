export default function EmptyState({ colSpan, message = 'No records found' }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ textAlign: 'center', padding: 40, color: '#64748b', fontSize: 13 }}>
        {message}
      </td>
    </tr>
  )
}
