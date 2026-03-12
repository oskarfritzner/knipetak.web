// Flexible object that holds details about an event (could be anything)
// The key can be any string, and value can be anything

export default interface EventDetails {
  [key: string]: unknown;
}
