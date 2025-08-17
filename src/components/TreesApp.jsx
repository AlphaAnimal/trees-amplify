import { useState, useEffect } from "react";
import {
  Button,
  Heading,
  Image,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listTrees } from "../graphql/queries";
import {
  createTree as createTreeMutation,
  deleteTree as deleteTreeMutation,
} from "../graphql/mutations";
import { uploadData, getUrl } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/api";
import "@aws-amplify/ui-react/styles.css";

function TreesApp({ signOut }) {
  const [trees, setTrees] = useState([]);
  const client = generateClient();

  useEffect(() => {
    fetchTrees();
  }, []);

  async function fetchTrees() {
    try {
      const apiData = await client.graphql({ query: listTrees });
      const treesFromAPI = apiData.data.listTrees.items;
      await Promise.all(
        treesFromAPI.map(async (tree) => {
          if (tree.image) {
            try {
              const url = await getUrl({
                key: tree.name,
                options: {
                  accessLevel: "guest",
                },
              });
              tree.image = url.url;
            } catch (error) {
              console.error("Error getting image URL:", error);
              tree.image = null;
            }
          }
          return tree;
        })
      );
      setTrees(treesFromAPI);
    } catch (error) {
      console.error("Error fetching trees:", error);
      setTrees([]);
    }
  }

  async function createTree(event) {
    event.preventDefault();
    try {
      const form = new FormData(event.target);
      const image = form.get("image");
      const data = {
        name: form.get("name"),
        description: form.get("description"),
        image: image.name,
      };
      if (data.image) {
        try {
          await uploadData({
            key: data.name,
            data: image,
            options: {
              accessLevel: "guest",
            },
          }).result;
        } catch (error) {
          console.error("Error uploading image:", error);
          data.image = null;
        }
      }
      await client.graphql({
        query: createTreeMutation,
        variables: { input: data },
      });
      fetchTrees();
      event.target.reset();
    } catch (error) {
      console.error("Error creating tree:", error);
      alert("Error creating tree. Please try again.");
    }
  }

  async function deleteTree({ id }) {
    try {
      const newTrees = trees.filter((tree) => tree.id !== id);
      setTrees(newTrees);
      await client.graphql({
        query: deleteTreeMutation,
        variables: { input: { id } },
      });
    } catch (error) {
      console.error("Error deleting tree:", error);
      alert("Error deleting tree. Please try again.");
      fetchTrees(); // Refresh the list to show the correct state
    }
  }

  return (
    <View className="App">
      <Heading level={1}>My Trees App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createTree}>
        <View margin="3rem 0">
          <label htmlFor="name">Tree Name:</label>
          <input
            required
            type="text"
            id="name"
            name="name"
            placeholder="Tree Name"
          />
        </View>
        <View margin="3rem 0">
          <label htmlFor="description">Tree Description:</label>
          <textarea
            required
            name="description"
            placeholder="Tree description"
            rows="3"
            cols="30"
          />
        </View>
        <View margin="3rem 0">
          <label htmlFor="image">Image:</label>
          <input type="file" name="image" accept="image/png, image/jpeg" />
        </View>
        <Button type="submit" variation="primary">
          Create Tree
        </Button>
      </View>
      <Heading level={2}>Current Trees</Heading>
      <View margin="3rem 0">
        {trees.map((tree) => (
          <View
            key={tree.id || tree.name}
            className="box"
            padding="1rem"
            border="1px solid #ddd"
            borderRadius="4px"
            margin="1rem 0"
          >
            <View>
              <Heading level={3}>{tree.name}</Heading>
              <p>{tree.description}</p>
              {tree.image && (
                <Image
                  src={tree.image}
                  alt={`visual aid for ${tree.name}`}
                  style={{ width: 400 }}
                />
              )}
              <Button variation="link" onClick={() => deleteTree(tree)}>
                Delete tree
              </Button>
            </View>
          </View>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
}

export default withAuthenticator(TreesApp);
