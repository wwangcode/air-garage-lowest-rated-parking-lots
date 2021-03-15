import { useState } from 'react'
import axios from 'axios'
import styles from '../styles/Home.module.css'
import 'antd/dist/antd.css'
import { Input, List, Pagination } from 'antd'


const Home = () => {
  const [ loading, setLoading ] = useState(false)
  const [ searchMessage, setSearchMessage ] = useState('')
  const [ searchInput, setSearchInput ] = useState('')
  const [ businesses, setBusinesses ] = useState([])
  const [ total, setTotal ] = useState(null)

  // API CALL 
  const handleYelpAPISearch = async (props) => {
    const { page, pageSize } = props
    const offset = page !== undefined ? (page - 1) * 20 : 0
    const num_results = pageSize !== undefined ? pageSize : 20
    if (searchInput === '') return setSearchMessage('Please input location and try again')

    try {
      const res = await axios.get('/api/yelp-api-search', {
        params: {
          location: searchInput,
          radius: 40000,
          categories: 'parking',
          sort_by: 'rating',
          offset: offset,
          limit: num_results,
        }
      })

      const businessesWithScore = res.data.businesses.map(item => {
        const score = (item.review_count * item.rating) / (item.review_count + 1)
        return {
          ...item,
          score,
        }
      })

      const sortedBusinesses = businessesWithScore.sort((a,b) => (a.score - b.score))
    
      setBusinesses(sortedBusinesses)
      setTotal(res.data.total)

    } catch {
      setSearchMessage('Something went wrong, please refresh the page and try again')
    }

  }


  // PAGINATION COMPONENT 

  const handlePagination = (page, pageSize) => {
    console.log(pageSize)
    handleYelpAPISearch({page, pageSize})
  } 

  const renderPagination = () => {
    return (
      <Pagination 
        style={{margin: '4rem'}}
        onChange={handlePagination}
        defaultCurrent={1}
        defaultPageSize={20}
        total={total}
        showSizeChanger
        pageSizeOptions={['10', '20', '30', '40', '50']}
      />
    )
  }
  
  console.log(businesses)

  // LIST COMPONENT 
  const renderList = () => {
    return (
      <List 
        style={{width: '600px'}}
        itemLayout="vertical"
        size="large"
        dataSource={businesses}
        renderItem={item => (
          <List.Item
            key={item.name}
            extra={
              <img
                width={200}
                height={200}
                style={{objectFit: 'cover'}}
                alt={item.name}
                src={item.image_url ? item.image_url : '/parking.svg'}
              />
            }
          >
            <List.Item.Meta
              title={<a href={item.url}>{item.name}</a>}
              description={item.location.display_address.map(index => (`${index}, `))}
            />
            {`Score: ${item.score}`}
            <br />
            {`Rating: ${item.rating}`}
            <br />
            {`Review Count: ${item.review_count}`}
          </List.Item>
        )}
      />
    )
  }

  // SEARCH BAR COMPONENT 
  const handleInputChange = (e) => {
    e.preventDefault()
    setSearchInput(e.target.value)
  }

  const renderSearchBar = () => {
    return (
        <div style={{margin: '2rem auto'}}>
          <div className={styles.title}>AirGarage Lowest Rated Parking Lots</div>
          <Input.Search 
            style={{width: '400px', marginTop: '1rem'}}
            placeholder="Search for parking lots by location" 
            enterButton="Search" 
            size="large" 
            loading={loading}
            onSearch={handleYelpAPISearch}
            onChange={handleInputChange}
          />
          {searchMessage}
        </div>
    )
  }

  return (
    <div className={styles.container}>
      {renderSearchBar()}
      {renderList()}
      {total && total > 0 && (renderPagination())}
    </div>
  )
}

export default Home