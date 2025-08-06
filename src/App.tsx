import './App.css';
import Category from './components/category';
import TreeList from './components/tree-list';

function App() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 350 }}>
          <h2>Category (with Search & Filter)</h2>
          <Category heading="Select Categories" showSelectAllButton={true} />
        </div>
        <div style={{ flex: 1, minWidth: 350 }}>
          <h2>Tree List (Full Data)</h2>
          <TreeList heading="All Categories" showSelectAllButton={true} />
        </div>
      </div>
    </div>
  );
}

export default App;