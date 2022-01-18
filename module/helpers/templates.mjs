/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/mycustomsystem/templates/actor/parts/actor-stats.html",
    "systems/mycustomsystem/templates/actor/parts/actor-skills.html",
    "systems/mycustomsystem/templates/actor/parts/actor-powers.html",
    "systems/mycustomsystem/templates/actor/parts/actor-health.html",
  ]);
};
