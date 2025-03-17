<template>
    <div class="unauthorized">
      <h1>403</h1>
      <p>Unauthorized Access</p>
      <p class="description">You don't have permission to access this page.</p>
      <router-link to="/" class="btn btn-primary">Go Home</router-link>
    </div>
  </template>
  
  <style scoped>
  .unauthorized {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
  }
  
  .unauthorized h1 {
    font-size: 6rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 1rem;
  }
  
  .unauthorized p {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }
  
  .description {
    font-size: 1rem;
    margin-bottom: 2rem;
    color: var(--text-color);
    opacity: 0.8;
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