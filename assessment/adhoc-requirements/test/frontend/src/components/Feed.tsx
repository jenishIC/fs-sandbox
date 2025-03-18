import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Button } from '@mui/material';
import axios from 'axios';

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  comments: Array<{
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
  }>;
}

export const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/api/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handleComment = async (postId: string, content: string) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/posts/${postId}/comments`, {
        content
      });
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, response.data] }
          : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
      {posts.map(post => (
        <Card key={post.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar src={post.author.avatar} sx={{ mr: 2 }} />
              <Typography variant="subtitle1">
                {post.author.name}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {post.content}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.createdAt).toLocaleString()}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Comments ({post.comments.length})
              </Typography>
              {post.comments.map(comment => (
                <Box key={comment.id} sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>{comment.author.name}:</strong> {comment.content}
                  </Typography>
                </Box>
              ))}
              <Button
                size="small"
                onClick={() => handleComment(post.id, 'Test comment')}
                sx={{ mt: 1 }}
              >
                Add Comment
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}; 