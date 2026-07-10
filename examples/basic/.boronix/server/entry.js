var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// examples/basic/boronix.config.ts
var boronix_config_exports = {};
__export(boronix_config_exports, {
  default: () => boronix_config_default
});
import { defineConfig } from "boronix";
var boronix_config_default = defineConfig({
  runtime: "bun",
  server: {
    port: 3e3,
    host: "0.0.0.0"
  },
  app: {
    root: "app",
    routesDir: "app/routes",
    publicDir: "public"
  }
});

// examples/basic/app/routes/page.ts
var page_exports = {};
__export(page_exports, {
  default: () => page_default
});
import { page } from "boronix";
var page_default = page(async () => {
  return {
    title: "Boronix"
  };
});

// examples/basic/app/routes/exercises/page.ts
var page_exports2 = {};
__export(page_exports2, {
  default: () => page_default2
});
import { page as page2 } from "boronix";

// examples/basic/app/server/exercises.ts
var exercises = [
  {
    id: "1",
    title: "Render HTML",
    description: "Create a page with server-rendered data."
  },
  {
    id: "2",
    title: "Handle actions",
    description: "Submit a form to a local route action."
  }
];
function findExercise(id) {
  return exercises.find((exercise) => exercise.id === id);
}

// examples/basic/app/routes/exercises/page.ts
var page_default2 = page2(async () => {
  return {
    title: "Exercises",
    exercises
  };
});

// examples/basic/app/routes/exercises/api.ts
var api_exports = {};
__export(api_exports, {
  GET: () => GET
});
import { api, json } from "boronix";
var GET = api(async () => {
  return json({
    exercises
  });
});

// examples/basic/app/routes/login/page.ts
var page_exports3 = {};
__export(page_exports3, {
  default: () => page_default3
});
import { page as page3 } from "boronix";
var page_default3 = page3(async () => {
  return {
    title: "Login"
  };
});

// examples/basic/app/routes/login/actions.ts
var actions_exports = {};
__export(actions_exports, {
  login: () => login
});
import { action, fail, redirect } from "boronix";
var login = action(async ({ form }) => {
  const email = form.string("email");
  const password = form.string("password");
  if (!email || !password) {
    return fail({
      message: "Sai t\xE0i kho\u1EA3n ho\u1EB7c m\u1EADt kh\u1EA9u"
    });
  }
  return redirect("/exercises");
});

// examples/basic/app/routes/exercises/[id]/page.ts
var page_exports4 = {};
__export(page_exports4, {
  default: () => page_default4
});
import { notFound, page as page4 } from "boronix";
var page_default4 = page4(async ({ params }) => {
  const exercise = findExercise(params.id ?? "");
  if (!exercise) {
    return notFound({
      message: "Exercise not found"
    });
  }
  return {
    title: exercise.title,
    description: exercise.description
  };
});

// examples/basic/app/routes/exercises/[id]/actions.ts
var actions_exports2 = {};
__export(actions_exports2, {
  submit: () => submit
});
import { action as action2, fail as fail2 } from "boronix";
var submit = action2(async ({ form }) => {
  const answer = form.string("answer");
  if (!answer) {
    return fail2({
      message: "Answer is required"
    });
  }
  return fail2({
    message: "Demo action received your answer."
  }, { status: 200 });
});

// examples/basic/.boronix.tmp/entry-source.js
globalThis.boronixCompiledModules = {
  "../../config": boronix_config_exports,
  "app/routes/page.ts": page_exports,
  "app/routes/exercises/page.ts": page_exports2,
  "app/routes/exercises/api.ts": api_exports,
  "app/routes/login/page.ts": page_exports3,
  "app/routes/login/actions.ts": actions_exports,
  "app/routes/exercises/[id]/page.ts": page_exports4,
  "app/routes/exercises/[id]/actions.ts": actions_exports2
};
