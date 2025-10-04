# BMAD Agent Quick Reference

This guide provides quick access to BMAD agent commands and their primary responsibilities for the Science Advantage project.

## 🚀 Quick Agent Reference

### **dev (James) - Full Stack Developer**

**When to use**: Code implementation, debugging, refactoring

```bash
*develop-story          # Implement a story from start to finish
*run-tests             # Execute linting and tests
*explain               # Get detailed explanation of recent changes
*review-qa             # Apply QA fixes from review
```

### **architect (Winston) - System Architect**

**When to use**: System design, architecture decisions, tech selection

```bash
*create-full-stack-architecture    # Design complete system architecture
*create-backend-architecture       # Design backend architecture
*create-front-end-architecture     # Design frontend architecture
*execute-checklist architect-checklist  # Run architecture review
```

### **qa (Quinn) - Test Architect**

**When to use**: Quality gates, testing strategy, code review

```bash
*review {story}         # Comprehensive story review with quality gate
*gate {story}          # Create/update quality gate decision
*test-design {story}   # Design comprehensive test scenarios
*risk-profile {story}  # Generate risk assessment matrix
*trace {story}         # Map requirements to tests
*nfr-assess {story}    # Validate non-functional requirements
```

### **ux-expert (Sally) - UX Expert**

**When to use**: UI/UX design, wireframes, user experience

```bash
*create-front-end-spec  # Create detailed frontend specifications
*generate-ui-prompt     # Generate AI frontend development prompts
```

### **po (Sarah) - Product Owner**

**When to use**: Backlog management, story refinement, acceptance criteria

```bash
*validate-story-draft {story}  # Validate story completeness
*execute-checklist-po          # Run product owner checklist
*correct-course                # Handle changes and course corrections
```

### **sm (Bob) - Scrum Master**

**When to use**: Story creation, process management, team coordination

```bash
*draft                 # Create next story from epic
*story-checklist       # Run story draft checklist
*correct-course        # Navigate changes and impacts
```

### **bmad-orchestrator - Workflow Coordinator**

**When to use**: Multi-agent tasks, role switching, workflow guidance

```bash
*help                 # Show all available commands
*agent {name}         # Transform into specific agent
*workflow-guidance    # Get help selecting workflows
*status               # Show current context and progress
```

### **bmad-master - Universal Executor**

**When to use**: Comprehensive expertise, one-off tasks

```bash
*help                 # Show all available commands
*task {task}          # Execute any specific task
*execute-checklist {checklist}  # Run any checklist
*create-doc {template} # Create documents from templates
```

---

## 🎯 Common Workflows

### **Implementing a New Story**

```bash
# 1. Create story (sm)
As sm, *draft

# 2. Design UX (ux-expert)
As ux-expert, *create-front-end-spec

# 3. Review architecture (architect)
As architect, *execute-checklist architect-checklist

# 4. Implement story (dev)
As dev, *develop-story

# 5. Quality review (qa)
As qa, *review {story-id}

# 6. Apply fixes if needed (dev)
As dev, *review-qa
```

### **Creating Architecture Documentation**

```bash
As architect, *create-full-stack-architecture
```

### **Quality Gate Process**

```bash
As qa, *review {story-id}
# This creates: qa.qaLocation/gates/{epic}.{story}-{slug}.yml
```

### **Handling Changes**

```bash
As po, *correct-course
# Or for process changes:
As sm, *correct-course
```

---

## 📋 Story Status Flow

1. **Draft** → Created by sm
2. **Review** → Ready for po validation
3. **In Progress** → Being implemented by dev
4. **Ready for Review** → Implementation complete, needs qa review
5. **Ready for Done** → Passed qa review, ready for acceptance

---

## 🔧 Agent-Specific File Permissions

### **dev (James)** - Can update:

- Tasks / Subtasks Checkboxes
- Dev Agent Record sections
- Agent Model Used
- Debug Log References
- Completion Notes List
- File List
- Change Log
- Status

### **qa (Quinn)** - Can update:

- QA Results section ONLY in story files
- Gate files in `qa.qaLocation/gates/`
- Assessment files in `qa.qaLocation/assessments/`

### **po (Sarah)** - Can update:

- All story sections during validation
- Epic files
- Backlog items

---

## 📁 Key File Locations

- **Stories**: `docs/stories/` (from `devStoryLocation` in core-config.yaml)
- **QA Gates**: `docs/qa/gates/` (from `qa.qaLocation` in core-config.yaml)
- **Architecture**: `docs/architecture/`
- **PRD**: `docs/prd/`
- **Sprint**: `docs/sprint/`

---

## 🚨 Emergency Commands

### **When Story is Blocked**

```bash
As sm, *correct-course
# Follow the change checklist to navigate blockers
```

### **Quality Issues**

```bash
As qa, *gate {story-id}
# Create immediate quality gate decision
```

### **Architecture Questions**

```bash
As architect, *execute-checklist architect-checklist
# Review architecture compliance
```

---

## 💡 Pro Tips

1. **Always use \*help** - Each agent has specialized commands
2. **Check status first** - Use `*status` to understand current context
3. **Follow the workflow** - Don't skip agents in the process
4. **Document decisions** - Use Dev Agent Record for implementation notes
5. **Quality first** - Always run qa review before marking stories complete

---

## 📞 Getting Help

- **General help**: Any agent, `*help`
- **Workflow guidance**: `*workflow-guidance`
- **Full knowledge base**: `*kb-mode`
- **Project documentation**: [docs/](./)

Remember: All commands start with `*` (asterisk)!
