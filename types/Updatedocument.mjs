import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLInt,
} from "graphql";

const UpdateDocumentType = new GraphQLObjectType({
  name: "UpdateDocument",
  description: "All documents",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export default UpdateDocumentType;
