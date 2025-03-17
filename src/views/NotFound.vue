<template>
    <div class="not-found">
      <h1>404</h1>
      <p>Page not found</p>
      <router-link to="/" class="btn btn-primary">Go Home</router-link>
    </div>
  </template>
  
  <style scoped>
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
  }
  
  .not-found h1 {
    font-size: 6rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 1rem;
  }
  
  .not-found p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: var(--text-color);
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    text-decoration: none;
  }
  
  .btn-primary {
    background-color: var(--primary-color);
    color: white;
  }
  
  .btn-primary:hover {
    background-color: var(--secondary-color);
  }
  </style>