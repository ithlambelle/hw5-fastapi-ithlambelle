"use client";

import React, { useState } from "react";
import { Input, Button, Card, Typography, Space, Alert, Spin, List, Tag } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const API_URL = "http://localhost:5000";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
}

export default function Home() {
  const [productId, setProductId] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchError, setSearchError] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  
  const [createName, setCreateName] = useState<string>("");
  const [createDescription, setCreateDescription] = useState<string>("");
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createSuccess, setCreateSuccess] = useState<boolean>(false);

  const searchById = async () => {
    if (!productId) return;
    
    setLoading(true);
    setError("");
    setProduct(null);
    
    try {
      const response = await fetch(`${API_URL}/products/${productId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("product not found");
        } else {
          setError("server error occurred");
        }
        return;
      }
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError("failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  const searchByKeyword = async () => {
    if (!searchKeyword) return;
    
    setSearchLoading(true);
    setSearchError("");
    setSearchResults([]);
    
    try {
      const response = await fetch(`${API_URL}/products/search/${searchKeyword}`);
      if (!response.ok) {
        setSearchError("server error occurred");
        return;
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setSearchError("failed to search products");
    } finally {
      setSearchLoading(false);
    }
  };

  const createProduct = async () => {
    if (!createName || !createDescription) return;
    
    setCreateLoading(true);
    setCreateSuccess(false);
    
    try {
      const response = await fetch(
        `${API_URL}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: createName,
            description: createDescription,
          }),
        }
      );
      if (!response.ok) {
        setSearchError("failed to create product");
        return;
      }
      const data = await response.json();
      setCreateSuccess(true);
      setCreateName("");
      setCreateDescription("");
      // optionally display created product
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err) {
      setSearchError("failed to create product");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={1}>product search</Title>
      
      {/* search by id */}
      <Card title="search by product id" style={{ marginBottom: "30px" }}>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="enter product id"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            onPressEnter={searchById}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={searchById} loading={loading}>
            search
          </Button>
        </Space.Compact>
        
        {error && <Alert message={error} type="error" style={{ marginTop: "16px" }} />}
        
        {loading && <Spin style={{ display: "block", textAlign: "center", marginTop: "16px" }} />}
        
        {product && !loading && (
          <Card style={{ marginTop: "16px" }}>
            <Text strong>id:</Text> {product.id}<br />
            <Text strong>name:</Text> {product.name}<br />
            <Text strong>description:</Text> {product.description}<br />
            <Text strong>price:</Text> ${product.price}<br />
            <Text strong>created at:</Text> {new Date(product.created_at).toLocaleString()}
          </Card>
        )}
      </Card>

      {/* bonus: search by keyword */}
      <Card title="search products by keyword" style={{ marginBottom: "30px" }}>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="enter keyword"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={searchByKeyword}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={searchByKeyword} loading={searchLoading}>
            search
          </Button>
        </Space.Compact>
        
        {searchError && <Alert message={searchError} type="error" style={{ marginTop: "16px" }} />}
        
        {searchLoading && <Spin style={{ display: "block", textAlign: "center", marginTop: "16px" }} />}
        
        {searchResults.length > 0 && !searchLoading && (
          <List
            style={{ marginTop: "16px" }}
            dataSource={searchResults}
            renderItem={(item) => (
              <List.Item>
                <Space direction="vertical">
                  <Text strong>{item.name}</Text>
                  <Text type="secondary">{item.description}</Text>
                  <Tag color="blue">${item.price}</Tag>
                </Space>
              </List.Item>
            )}
          />
        )}
        
        {searchResults.length === 0 && !searchLoading && searchKeyword && !searchError && (
          <Alert message="no products found" type="info" style={{ marginTop: "16px" }} />
        )}
      </Card>

      {/* bonus: create product */}
      <Card title="create new product">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="product name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
          <Input
            placeholder="product description"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={createProduct} loading={createLoading}>
            create product
          </Button>
          
          {createSuccess && <Alert message="product created successfully" type="success" />}
        </Space>
      </Card>
    </div>
  );
}
