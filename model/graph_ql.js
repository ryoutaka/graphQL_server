const { ApolloServer, gql } = require("apollo-server-express");
const db = require("./databese");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Task {
    id: Int
    text: String
    checked: Boolean
  }
  type Query {
    taskItems: [Task]
  }

  type Mutation {
    createTaskItem(text: String!): Task
    changeCheckedFlag(id: Int, checked: Boolean): Task
    changeText(id: Int, text: String): Task
    deleteTaskItem(id: Int): Task
    deleteCheckedTaskItem: [Task]
  }
`;

const resolvers = {
  Query: {
    taskItems: async () => {
      const taskItems = await db("task_items").orderBy("id");
      return taskItems;
    },
  },
  Mutation: {
    createTaskItem: async (parent, arg) => {
      const result = await db("task_items")
        .insert({ text: arg.text, checked: false })
        .then((res) => {
          return db("task_items").orderBy("id", "desc").limit(1);
        });
      return result[0];
    },
    changeCheckedFlag: async (parent, arg) => {
      const nextChecked = !arg.checked;
      const result = await db("task_items")
        .where({ id: arg.id })
        .update({ checked: nextChecked })
        .then((res) => {
          return db("task_items").where({ id: arg.id });
        });
      return result[0];
    },
    changeText: async (parent, arg) => {
      const result = await db("task_items")
        .where({ id: arg.id })
        .update({ text: arg.text })
        .then((res) => {
          return db("task_items").where({ id: arg.id });
        });

      return result[0];
    },
    deleteTaskItem: async (parent, arg) => {
      const deleteId = await db("task_items")
        .where({ id: arg.id })
        .delete()
        .then(() => arg.id);

      return { id: arg.id };
    },
    deleteCheckedTaskItem: async (parent, arg) => {
      await db("task_items").where({ checked: true }).del();
      const result = db("task_items").orderBy("id");
      console.log(result);
      return result;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

module.exports = server;
