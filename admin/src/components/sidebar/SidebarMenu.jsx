import SidebarItem from './SidebarItem.jsx'
import SidebarGroup from './SidebarGroup.jsx'
import { menuItems } from './menuConfig.js'

export default function SidebarMenu({ collapsed }) {
  return (
    <nav style={{ padding: collapsed ? '14px 6px' : '14px 10px', flex: 1 }}>
      {!collapsed && (
        <div style={{
          fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 1, color: 'rgba(255,255,255,.3)', padding: '0 10px', marginBottom: 10,
        }}>
          MAIN MENU
        </div>
      )}
      {menuItems.map(item =>
        item.children
          ? <SidebarGroup key={item.key} item={item} collapsed={collapsed} />
          : <SidebarItem key={item.key} item={item} collapsed={collapsed} />
      )}
    </nav>
  )
}
